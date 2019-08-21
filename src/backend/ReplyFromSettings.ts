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

  public async reply(eventType: String, event: sdk.IO.Event, ctx: Telegraf<ContextMessageUpdate>, chatId: string): Promise<any> {
    if (eventType === 'carousel' || eventType === 'card') {
      return this.sendCarousel(event, ctx, chatId)
    }

    if (eventType !== 'text') return false
    let buttons, edit: ExtraEditMessage, tBtn
    let msg = event.payload.text
    let settings: ITelegramSettings = event.payload.t62Settings ? event.payload.t62Settings.telegram : null
    if (settings) {
      settings = Object.assign(settings, this.defaultSettings)
      buttons = this.getButtons(settings.buttons)
      edit = {
        parse_mode: settings.parser || 'HTML'
      }
      tBtn = (!buttons) ? tBtn : (settings.buttons.type !== 'keyboard') ? 'inline_keyboard' : 'keyboard'
    } else if (this.defaultSettings) {
      /*  buttons = this.getButtons({
          type: this.defaultSettings.buttonType,
          buttons: event.payload.elements || event.payload.quick_replies
        })
        edit = {
          parse_mode: this.defaultSettings.parse          /*reply_markup:{
          }
        }
        tBtn = (!buttons) ? tBtn : (this.defaultSettings.buttonType !== 'keyboard') ? 'inline_keyboard' : 'keyboard'
          */
      const defBtn = this.getButtonDef(event.payload.elements || event.payload.quick_replies)
      buttons = defBtn.buttons
      edit = defBtn.edit
      tBtn = defBtn.eBtn
    }

    (edit as any).reply_markup = {
      one_time_keyboard: true,
      resize_keyboard: true,
      remove_keyboard: !buttons ? true : false
    }
    if (buttons && tBtn) {
      (edit as any).reply_markup = buttons
    }
    return await ctx.telegram.sendMessage(chatId, msg, edit)

  }

  private getButtonDef(butt: any[]): any {
    let edit: ExtraEditMessage, tBtn
    const buttons = this.getButtons({
      type: this.defaultSettings.buttonType,
      buttons: butt
    })
    edit = {
      parse_mode:  this.defaultSettings.parser
      /*reply_markup:{
      }*/
    }
    tBtn = (!buttons) ? tBtn : (this.defaultSettings.buttonType !== 'keyboard') ? 'inline_keyboard' : 'keyboard'
    return { buttons, edit, tBtn }
  }


  private async sendCarousel(event: sdk.IO.Event, ctx: Telegraf<ContextMessageUpdate>, chatId: string): Promise<any> {
    if (this.defaultSettings) {
      const elem = event.payload.elements[0]
      const { buttons, edit, tBtn } = this.getButtonDef(elem.buttons)

      const img = (elem.picture.indexOf("localhost")>-1)?"The picture from localhost is not displayed in the telegram":"Photo";
      const msg =
        `${elem.title}
         ${elem.subtitle}
        <a href='${elem.picture}'>${img}</a>
       `;
      (edit as any).reply_markup = {
        disable_web_page_preview:true,
        one_time_keyboard: true,
        resize_keyboard: true,
        remove_keyboard: !buttons ? true : false
      }
      if (buttons && tBtn) {
        (edit as any).reply_markup = buttons
      }

      await ctx.telegram.sendMessage(chatId, msg, edit)
      return true
    } else {
      return this.replyDefMethods.send_carousel(event, ctx, chatId)
    }
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
      const key = (b.payload || b.callback_data || b.title).toLocaleUpperCase()
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
