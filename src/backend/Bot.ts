import * as sdk from 'botpress/sdk'
import Telegraf, { ContextMessageUpdate } from 'telegraf'
import { Config } from '../config'
import { ClientReceive } from './ClientReceive'
import { ReplyToClient } from './ReplyToClient'
import { ClientEvent } from './typings'

export class Bot {

  private _config: Config
  private receive: ClientReceive
  private replyTo: ReplyToClient

  private clients: Map<string, Telegraf<ContextMessageUpdate>> = new Map<string, Telegraf<ContextMessageUpdate>>()

  constructor(private bp: typeof sdk) {
    this.receive = new ClientReceive(bp)
    this.replyTo = new ReplyToClient(bp, this)
    this.setupMiddleware()
  }

  public setupMiddleware() {
    this.bp.events.registerMiddleware({
      description:
        'Sends out messages that targets platform = telegram.' +
        ' This middleware should be placed at the end as it swallows events once sent.',
      direction: 'outgoing',
      handler: this.replyTo.outgoingHandler.bind(this.replyTo),
      name: 'telegram.sendMessages',
      order: 100
    })
  }

  public async init(config: Config, botId: string): Promise<Telegraf<ContextMessageUpdate>> {
    this._config = config
    this.replyTo.init(config);
    const bot = new Telegraf(config.botToken)
    this.clients.set(botId, bot)

    return bot
  }

  public async setupBot(botId: string) {
    const client = this.getBot(botId)

    client.start(ctx => this.receive.sendEvent({ botId, ctx, type: 'start' }))
    client.help(ctx => this.receive.sendEvent({ botId, ctx, type: 'help' }))
    client.on(ClientEvent.MESSAGE, ctx => this.receive.sendEvent({
      botId,
      ctx,
      type: ClientEvent.MESSAGE
    }))
    client.on(ClientEvent.CALLBACK_QUERY, ctx => this.receive.sendEvent({
      botId,
      ctx,
      type: ClientEvent.CALLBACK_QUERY
    }))
    // TODO We don't support understanding and accepting more complex stuff from users such as files, audio etc
  }


  public getBot(botId: string): Telegraf<ContextMessageUpdate> {
    return this.clients.get(botId)
  }

  public async removeBot(botId: string): Promise<any> {
    const bot = this.clients.get(botId)
    if (bot) {
      bot.stop()
    }
    this.clients.delete(botId)
  }

  // @ts-ignore
  public get config():Config{
    return this._config
  }
}
