import * as sdk from "botpress/sdk"
import path from "path"
import Telegraf, { Button, CallbackButton, ContextMessageUpdate, Extra, Markup } from 'telegraf'

export class ReplyDefMethods {
  constructor(){

  }

  public async send_typing(event: sdk.IO.Event, client: Telegraf<ContextMessageUpdate>, chatId: string) {
    const typing = this.parseTyping(event.payload.value)
    await client.telegram.sendChatAction(chatId, 'typing')
    await Promise.delay(typing)

  }

  public async send_text(event: sdk.IO.Event, client: Telegraf<ContextMessageUpdate>, chatId: string) {
    const keyboard = Markup.keyboard(this.keyboardButtons<Button>(event.payload.quick_replies))
    if (event.payload.markdown != false) {
      // Attempt at sending with markdown first, fallback to regular text on failure
      await client.telegram
        .sendMessage(chatId, event.preview, Extra.markdown(true).markup({ ...keyboard, one_time_keyboard: true }))
        .catch(() =>
          client.telegram.sendMessage(
            chatId,
            event.preview,
            Extra.markdown(false).markup({ ...keyboard, one_time_keyboard: true })
          )
        )
    } else {
      await client.telegram.sendMessage(
        chatId,
        event.preview,
        Extra.markdown(false).markup({ ...keyboard, one_time_keyboard: true })
      )
    }
  }

  public async  send_image(event: sdk.IO.Event, client: Telegraf<ContextMessageUpdate>, chatId: string) {
    const keyboard = Markup.keyboard(this.keyboardButtons<Button>(event.payload.quick_replies))
    if (event.payload.url.toLowerCase().endsWith('.gif')) {
      await client.telegram.sendAnimation(
        chatId,
        event.payload.url,
        Extra.markdown(false).markup({ ...keyboard, one_time_keyboard: true })
      )
    } else {
      await client.telegram.sendPhoto(
        chatId,
        event.payload.url,
        Extra.markdown(false).markup({ ...keyboard, one_time_keyboard: true })
      )
    }
  }

  public async send_carousel(event: sdk.IO.Event, client: Telegraf<ContextMessageUpdate>, chatId: string) {
    if (event.payload.elements && event.payload.elements.length) {
      const { title, picture, subtitle } = event.payload.elements[0]
      const buttons = event.payload.elements.map(x => x.buttons)
      if (picture) {
        await client.telegram.sendChatAction(chatId, 'upload_photo')
        await client.telegram.sendPhoto(chatId, { url: picture, filename: path.basename(picture) })
      }
      const keyboard = this.keyboardButtons<CallbackButton>(buttons)
      await client.telegram.sendMessage(
        chatId,
        `*${title}*\n${subtitle}`,
        Extra.markdown(true).markup(Markup.inlineKeyboard(keyboard))
      )
    }
  }


  private keyboardButtons<T>(arr: any[] | undefined): T[] | undefined {
    if (!arr || !arr.length) {
      return undefined
    }

    const rows = arr[0].length ? arr : [arr]

    return rows.map(
      row =>
        row.map(x => {
          if (x.url) {
            return Markup.urlButton(x.title, x.url)
          }

          return Markup.callbackButton(x.title, x.payload)
        }) as any
    )
  }

  private parseTyping(typing): number {
    if (isNaN(typing)) {
      return 1000
    }
    return Math.max(typing, 500)
  }
}
