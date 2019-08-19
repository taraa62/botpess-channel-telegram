"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ReplyToClient = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

var _ReplyDefMethods = require("./ReplyDefMethods");

var _ReplyFromSettings = require("./ReplyFromSettings");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class ReplyToClient {
  constructor(bp, bot) {
    this.bp = bp;
    this.bot = bot;

    _defineProperty(this, "outgoingTypes", ['text', 'typing', 'image', 'login_prompt', 'carousel', 'settings']);

    _defineProperty(this, "replyFromSettings", void 0);

    _defineProperty(this, "replyDefMethods", void 0);

    this.replyDefMethods = new _ReplyDefMethods.ReplyDefMethods();
    this.replyFromSettings = new _ReplyFromSettings.ReplyFromSettings(bp, this, this.replyDefMethods);
  }

  init(config) {
    if (!this.replyFromSettings.defaultSettings) {
      this.replyFromSettings.updateDefSettings(config.defaultSettings);
    }
  }

  async outgoingHandler(event, next) {
    if (event.channel !== 'telegram') {
      return next();
    }

    const client = this.bot.getBot(event.botId);

    if (!client) {
      return next();
    }

    let messageType = event.type === 'default' ? 'text' : event.type;
    const chatId = event.threadId || event.target;

    if (!_lodash.default.includes(this.outgoingTypes, messageType)) {
      return next(new Error('Unsupported event type: ' + event.type));
    }

    const key = 'send_' + messageType;
    if (messageType === "typing") return await this.replyDefMethods[key](event, client, chatId);
    if (this.replyFromSettings.defaultSettings) return await this.replyFromSettings.reply(event, client, chatId);
    if (messageType === 'settings') return await this.replyFromSettings.reply(event, client, chatId);
    if (this.replyDefMethods[key]) return await this.replyDefMethods[key](event, client, chatId); // TODO We don't support sending files, location requests (and probably more) yet

    throw new Error(`Message type "${messageType}" not implemented yet`);
  }

}

exports.ReplyToClient = ReplyToClient;
//# sourceMappingURL=ReplyToClient.js.map