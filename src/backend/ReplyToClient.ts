import * as sdk from 'botpress/sdk'
import _ from 'lodash'
import Telegraf, { ContextMessageUpdate } from 'telegraf'
import { Config } from '../config'
import { Bot } from './Bot'
import { ReplyDefMethods } from './ReplyDefMethods'
import { ReplyFromSettings } from './ReplyFromSettings'

export class ReplyToClient {

  private outgoingTypes = ['text', 'typing', 'image', 'login_prompt', 'carousel']
  private replyFromSettings: ReplyFromSettings
  private replyDefMethods: ReplyDefMethods


  constructor(private bp: typeof sdk, private bot: Bot) {
    this.replyDefMethods = new ReplyDefMethods()
    this.replyFromSettings = new ReplyFromSettings(bp, this, this.replyDefMethods)
  }

  public init(config: Config): void {
    if (!this.replyFromSettings.defaultSettings) {
      this.replyFromSettings.updateDefSettings(config.defaultSettings)
    }
  }

  public async outgoingHandler(event: sdk.IO.Event, next: sdk.IO.MiddlewareNextCallback): Promise<any> {
    if (event.channel !== 'telegram') {
      return next()
    }
    const client: Telegraf<ContextMessageUpdate> = this.bot.getBot(event.botId)
    if (!client) {
      return next()
    }

    let messageType = event.type === 'default' ? 'text' : event.type
    const chatId = event.threadId || event.target

    if (!_.includes(this.outgoingTypes, messageType)) {
      return next(new Error('Unsupported event type: ' + event.type))
    }

    const key = 'send_' + messageType

    // if (this.replyDefMethods[key]) return await this.replyDefMethods[key](event, client, chatId)

    if (messageType === 'typing') return await this.replyDefMethods[key](event, client, chatId)

    if (key.indexOf('card') < 0 && key.indexOf('carousel') < 0)
      if (this.replyFromSettings.defaultSettings || event.payload.t62Settings) return await this.replyFromSettings.reply(event, client, chatId)

    if (this.replyDefMethods[key]) return await this.replyDefMethods[key](event, client, chatId)

    // TODO We don't support sending files, location requests (and probably more) yet
    throw new Error(`Message type "${messageType}" not implemented yet`)
  }


}
