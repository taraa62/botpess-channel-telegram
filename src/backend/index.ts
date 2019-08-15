import 'bluebird-global'
import * as sdk from 'botpress/sdk'


import { Config } from '../config'
import { Bot } from './Bot'


const whMiddleware: any = {}
let useWebhooks: boolean = true
let whPath = ''
let bot: Bot

const onServerReady = async (bp: typeof sdk) => {

  if (useWebhooks) {
    const router = bp.http.createRouterForBot('channel-telegram-t62', {
      checkAuthentication: false,
      enableJsonBodyParser: false // telegraf webhook has its custom body parser
    })

    whPath = (await router.getPublicPath()) + '/webhook'

    router.use('/webhook', (req, res, next) => {
      const { botId } = req.params
      if (typeof whMiddleware[botId] === 'function') {
        whMiddleware[botId](req, res, next)
      } else {
        res.status(404).send({ message: `Bot "${botId}" not a Telegram bot` })
      }
    })
  }
}

const onServerStarted = async (bp: typeof sdk) => {
  const config = (await bp.config.getModuleConfig('channel-telegram-t62')) as Config
  useWebhooks = config.forceWebhook || process.CLUSTER_ENABLED

  if (!bot) bot = new Bot(bp)
}

const onBotMount = async (bp: typeof sdk, botId: string) => {
  const config = (await bp.config.getModuleConfigForBot('channel-telegram-t62', botId)) as Config

  if (config.enabled) {
    const _bot = await bot.init(config, botId)
    if (useWebhooks) {
      await _bot.telegram.setWebhook(whPath.replace('BOT_ID', botId))
      whMiddleware[botId] = _bot.webhookCallback('/')
    } else {
      await _bot.telegram.deleteWebhook()
      _bot.startPolling()
    }
    await bot.setupBot(botId)
  }
}

const onBotUnmount = async (bp: typeof sdk, botId: string) => {
  await bot.removeBot(botId).catch(er => console.error(er))
  delete whMiddleware[botId]
}

const onModuleUnmount = async (bp: typeof sdk) => {
  bp.events.removeMiddleware('telegram.sendMessages')
}

const entryPoint: sdk.ModuleEntryPoint = {
  onServerStarted,
  onServerReady,
  onBotMount,
  onBotUnmount,
  onModuleUnmount,
  definition: {
    name: 'channel-telegram-t62',
    menuIcon: 'none', // no interface = true
    fullName: 'Telegram',
    homepage: 'https://botpress.io',
    noInterface: true,
    plugins: []
  }
}

export default entryPoint
