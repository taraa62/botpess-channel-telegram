"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ClientReceive = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

var _typings = require("./typings");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class ClientReceive {
  constructor(bp) {
    this.bp = bp;
  }

  sendEvent(receive) {
    switch (receive.type) {
      case _typings.ClientEvent.CALLBACK_QUERY:
        if (receive.ctx.callbackQuery) {
          receive.type = 't62callback';

          this._sendEvent(receive, {
            text: 'callback',
            callbackQuery: receive.ctx.callbackQuery,
            ...receive.ctx.from,
            ...receive.ctx.chat
          }, receive.ctx.callbackQuery.data);

          break;
        }

      default:
        if (receive.ctx.message && receive.ctx.message.text) {
          this._sendEvent(receive, { ...receive.ctx.from,
            ...receive.ctx.chat,
            //message: receive.ctx.message,
            text: receive.ctx.message.text
          }, receive.ctx.message.text);
        }

        break;
    }
  }

  _sendEvent({
    ctx,
    type,
    botId
  }, message, preview = '') {
    const threadId = _lodash.default.get(ctx, 'chat.id') || _lodash.default.get(ctx, 'message.chat.id');

    const target = _lodash.default.get(ctx, 'from.id') || _lodash.default.get(ctx, 'message.from.id');

    this.bp.events.sendEvent(this.bp.IO.Event({
      botId: botId,
      channel: 'telegram',
      direction: 'incoming',
      payload: ctx.message ? ctx.message : message,
      preview: preview,
      threadId: threadId && threadId.toString(),
      target: target && target.toString(),
      type: type
    }));
  }

}

exports.ClientReceive = ClientReceive;
//# sourceMappingURL=ClientReceive.js.map