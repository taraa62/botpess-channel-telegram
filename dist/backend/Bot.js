"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Bot = void 0;

var _telegraf = _interopRequireDefault(require("telegraf"));

var _ClientReceive = require("./ClientReceive");

var _ReplyToClient = require("./ReplyToClient");

var _typings = require("./typings");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class Bot {
  constructor(bp) {
    this.bp = bp;

    _defineProperty(this, "_config", void 0);

    _defineProperty(this, "receive", void 0);

    _defineProperty(this, "replyTo", void 0);

    _defineProperty(this, "clients", new Map());

    this.receive = new _ClientReceive.ClientReceive(bp);
    this.replyTo = new _ReplyToClient.ReplyToClient(bp, this);
    this.setupMiddleware();
  }

  setupMiddleware() {
    this.bp.events.registerMiddleware({
      description: 'Sends out messages that targets platform = telegram.' + ' This middleware should be placed at the end as it swallows events once sent.',
      direction: 'outgoing',
      handler: this.replyTo.outgoingHandler.bind(this.replyTo),
      name: 'telegram.sendMessages',
      order: 100
    });
  }

  async init(config, botId) {
    this._config = config;
    this.replyTo.init(config);
    const bot = new _telegraf.default(config.botToken);
    this.clients.set(botId, bot);
    return bot;
  }

  async setupBot(botId) {
    const client = this.getBot(botId);
    client.start(ctx => this.receive.sendEvent({
      botId,
      ctx,
      type: 'start'
    }));
    client.help(ctx => this.receive.sendEvent({
      botId,
      ctx,
      type: 'help'
    }));
    client.on(_typings.ClientEvent.MESSAGE, ctx => this.receive.sendEvent({
      botId,
      ctx,
      type: _typings.ClientEvent.MESSAGE
    }));
    client.on(_typings.ClientEvent.CALLBACK_QUERY, ctx => this.receive.sendEvent({
      botId,
      ctx,
      type: _typings.ClientEvent.CALLBACK_QUERY
    })); // TODO We don't support understanding and accepting more complex stuff from users such as files, audio etc
  }

  getBot(botId) {
    return this.clients.get(botId);
  }

  async removeBot(botId) {
    const bot = this.clients.get(botId);

    if (bot) {
      bot.stop();
    }

    this.clients.delete(botId);
  } // @ts-ignore


  get config() {
    return this._config;
  }

}

exports.Bot = Bot;
//# sourceMappingURL=Bot.js.map