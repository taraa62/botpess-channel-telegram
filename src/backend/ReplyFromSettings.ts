import * as sdk from 'botpress/sdk'
import Telegraf, { ContextMessageUpdate, Markup } from 'telegraf'
import { ExtraEditMessage } from 'telegraf/typings/telegram-types'
import { IDefSettingTelegram } from '../config'
import { ReplyDefMethods } from './ReplyDefMethods'
import { ReplyToClient } from './ReplyToClient'
import { ITelButtons, ITelegramSettings } from './typings'

export class ReplyFromSettings {

  public defaultSettings: IDefSettingTelegram

  constructor(private bp: typeof sdk, private parent: ReplyToClient, private replyDefMethods: ReplyDefMethods) {

  }

  public updateDefSettings(conf: IDefSettingTelegram): void {
    this.defaultSettings = conf

    const def: IDefSettingTelegram = {
      parser: 'HTML',
      buttonType: 'keyboard'
    }
    this.defaultSettings = Object.assign(def, this.defaultSettings)
  }

  public async reply(event: sdk.IO.Event, ctx: Telegraf<ContextMessageUpdate>, chatId: string): Promise<any> {

    let buttons, edit: ExtraEditMessage, msg, tBtn

    let settings: ITelegramSettings = event.payload.t62Settings ? event.payload.t62Settings.telegram : null
    if (settings) {
      settings = Object.assign(settings, this.defaultSettings)
      buttons = this.getButtons(settings.buttons)
      edit = {
        parse_mode: settings.parser || 'HTML'
      }
      tBtn = (!buttons) ? tBtn : (settings.buttons.type !== 'keyboard') ? 'inline_keyboard' : 'keyboard'
      msg = settings.text
    } else if (this.defaultSettings) {
      buttons = this.getButtons({
        type: this.defaultSettings.buttonType,
        buttons: event.payload.elements || event.payload.quick_replies
      })
      edit = {
        parse_mode: this.defaultSettings.parser
        /*reply_markup:{

        }*/
      }
      msg = event.payload.text || event.preview || ''
      tBtn = (!buttons) ? tBtn : (this.defaultSettings.buttonType !== 'keyboard') ? 'inline_keyboard' : 'keyboard'
    }

    (edit as any).reply_markup = {
      one_time_keyboard: true,
      resize_keyboard: true,
      remove_keyboard: !buttons ? true : false
    }
    if (buttons && tBtn) {
      (edit as any).reply_markup = buttons
    }
    (ctx as any).dataBtn = buttons
    await ctx.telegram.sendMessage(chatId, msg, edit)

  }

  private getButtons(sett: ITelButtons) {
    const getCallBackBtn = (title: string, callback: string, hide: boolean = false) => {
      return Markup.callbackButton(title, callback, hide)
    }
    const getUrlBtn = (title: string, url: string, hide: boolean = false) => {
      return Markup.urlButton(title, url, hide)
    }
    let res: any[] = null
    if (sett && sett.buttons) {
      res = []
      sett.buttons.map(v => {
        (v.url) ? res.push(getUrlBtn(v.title, v.url || v.payload, !!v.hide)) : res.push(getCallBackBtn(v.title, v.callback || v.payload, !!v.hide))
      })
      res = this.checkGroupBtn(res)
      if (sett.type !== 'keyboard') {
        return Markup.inlineKeyboard(res)
      } else {
        return Markup.keyboard(res)
      }
    }
    return res
  }

  private checkGroupBtn(buttons: any[]): any[] {
    const temp = new Map()

    for (let i = 0; i < buttons.length; i++) {
      const b = buttons[i]
      const key = b.payload || b.callback_data || b.title
      if (key.indexOf('_GR') > -1) {
        const gr = key.split('_GR')[1]
        if (gr) {
          const arr = temp.get(gr) ? temp.get(gr) : []
          arr.push(b)
          temp.set(gr, arr)
        }
      } else {
        temp.set(key, [b])
        // temp[key] = b
      }
    }

    const res = []
      Array.from(temp).forEach(v => res.push(v[1]))
    return res

  }
}
