import { ParseMode } from 'telegraf/typings/telegram-types'

export interface Config {
  /** The bot token received from the Telegram Botfather */
  botToken: string

  /** Enable or disable this channel for this bot */
  enabled: boolean

  /** Force usage of webhooks */
  forceWebhook: boolean

  defaultSettings: IDefSettingTelegram
}

export interface IDefSettingTelegram {
  parser: ParseMode
  buttonType: ButtonType
}


export type ButtonType = "keyboard" | "inlineKeyboard"
