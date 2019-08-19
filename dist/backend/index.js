"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("bluebird-global");

var _Bot = require("./Bot");

const whMiddleware = {};
let useWebhooks = true;
let whPath = '';
let bot;

const onServerReady = async bp => {
  if (useWebhooks) {
    const router = bp.http.createRouterForBot('channel-telegram-t62', {
      checkAuthentication: false,
      enableJsonBodyParser: false // telegraf webhook has its custom body parser

    });
    whPath = (await router.getPublicPath()) + '/webhook';
    router.use('/webhook', (req, res, next) => {
      const {
        botId
      } = req.params;

      if (typeof whMiddleware[botId] === 'function') {
        whMiddleware[botId](req, res, next);
      } else {
        res.status(404).send({
          message: `Bot "${botId}" not a Telegram bot`
        });
      }
    });
  }
};

const onServerStarted = async bp => {
  const config = await bp.config.getModuleConfig('channel-telegram-t62');
  useWebhooks = config.forceWebhook || process.CLUSTER_ENABLED;
  if (!bot) bot = new _Bot.Bot(bp);
};

const onBotMount = async (bp, botId) => {
  const config = await bp.config.getModuleConfigForBot('channel-telegram-t62', botId);

  if (config.enabled) {
    const _bot = await bot.init(config, botId);

    if (useWebhooks) {
      await _bot.telegram.setWebhook(whPath.replace('BOT_ID', botId));
      whMiddleware[botId] = _bot.webhookCallback('/');
    } else {
      await _bot.telegram.deleteWebhook();

      _bot.startPolling();
    }

    await bot.setupBot(botId);
  }
};

const onBotUnmount = async (bp, botId) => {
  await bot.removeBot(botId).catch(er => console.error(er));
  delete whMiddleware[botId];
};

const onModuleUnmount = async bp => {
  bp.events.removeMiddleware('telegram.sendMessages');
};

const entryPoint = {
  onServerStarted,
  onServerReady,
  onBotMount,
  onBotUnmount,
  onModuleUnmount,
  definition: {
    name: 'channel-telegram-t62',
    menuIcon: 'none',
    // no interface = true
    fullName: 'Telegram',
    homepage: 'https://botpress.io',
    noInterface: true,
    plugins: []
  }
};
var _default = entryPoint;
exports.default = _default;
//# sourceMappingURL=index.js.map