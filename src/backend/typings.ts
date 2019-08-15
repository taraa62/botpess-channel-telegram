import { ContextMessageUpdate } from 'telegraf'
import { ParseMode } from 'telegraf/typings/telegram-types'


export enum ClientEvent {
  MESSAGE = 'message',
  CALLBACK_QUERY = 'callback_query'
}

export type ReceiveMess = {
  botId: string,
  ctx: ContextMessageUpdate,
  type: string
}

export interface ITelegramSettings{
  parser:ParseMode;
  text:string;
  buttons:ITelButtons;
}

export interface ITelButtons{
  type:string;
  buttons:ITelButtonsItem[]
}

export interface ITelButtonsItem {
  title:string;
  url?:string;
  payload?:string
  callback?:string;
  hide?: boolean;
}
