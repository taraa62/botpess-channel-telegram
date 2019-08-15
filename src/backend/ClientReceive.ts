import * as sdk from 'botpress/sdk'
import _ from 'lodash'
import { ClientEvent, ReceiveMess } from './typings'

export class ClientReceive {

  constructor(private bp: typeof sdk) {

  }

  public sendEvent(receive: ReceiveMess): void {
    switch (receive.type) {
      case ClientEvent.CALLBACK_QUERY:
        if (receive.ctx.callbackQuery) {
          receive.type = "t62callback"
          this._sendEvent(receive, { text: 'callback', ctx: receive.ctx.callbackQuery }, receive.ctx.callbackQuery.data)
          break
        }

      default:
        if (receive.ctx.message && receive.ctx.message.text) {
          this._sendEvent(receive, receive.ctx.message, receive.ctx.message.text)
        }
        break
    }
  }

  private _sendEvent({ ctx, type, botId }: ReceiveMess, message: any, preview: string = ''): void {
    const threadId = _.get(ctx, 'chat.id') || _.get(ctx, 'message.chat.id')
    const target = _.get(ctx, 'from.id') || _.get(ctx, 'message.from.id')

    this.bp.events.sendEvent(
      this.bp.IO.Event({
        botId:botId,
        channel: 'telegram',
        direction: 'incoming',
        payload: ctx.message ? ctx.message : message,
        preview: preview,
        threadId: threadId && threadId.toString(),
        target: target && target.toString(),
        type: type
      })
    )
  }

}
