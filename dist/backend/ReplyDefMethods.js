"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ReplyDefMethods = void 0;

var _path = _interopRequireDefault(require("path"));

var _telegraf = require("telegraf");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class ReplyDefMethods {
  constructor() {}

  async send_typing(event, client, chatId) {
    const typing = this.parseTyping(event.payload.value);
    await client.telegram.sendChatAction(chatId, 'typing');
    await Promise.delay(typing);
  }

  async send_text(event, client, chatId) {
    const keyboard = _telegraf.Markup.keyboard(this.keyboardButtons(event.payload.quick_replies));

    if (event.payload.markdown != false) {
      // Attempt at sending with markdown first, fallback to regular text on failure
      await client.telegram.sendMessage(chatId, event.preview, _telegraf.Extra.markdown(true).markup({ ...keyboard,
        one_time_keyboard: true
      })).catch(() => client.telegram.sendMessage(chatId, event.preview, _telegraf.Extra.markdown(false).markup({ ...keyboard,
        one_time_keyboard: true
      })));
    } else {
      await client.telegram.sendMessage(chatId, event.preview, _telegraf.Extra.markdown(false).markup({ ...keyboard,
        one_time_keyboard: true
      }));
    }
  }

  async send_image(event, client, chatId) {
    const keyboard = _telegraf.Markup.keyboard(this.keyboardButtons(event.payload.quick_replies));

    if (event.payload.url.toLowerCase().endsWith('.gif')) {
      await client.telegram.sendAnimation(chatId, event.payload.url, _telegraf.Extra.markdown(false).markup({ ...keyboard,
        one_time_keyboard: true
      }));
    } else {
      await client.telegram.sendPhoto(chatId, event.payload.url, _telegraf.Extra.markdown(false).markup({ ...keyboard,
        one_time_keyboard: true
      }));
    }
  }

  async send_carousel(event, client, chatId) {
    if (event.payload.elements && event.payload.elements.length) {
      const {
        title,
        picture,
        subtitle
      } = event.payload.elements[0];
      const buttons = event.payload.elements.map(x => x.buttons);

      if (picture) {
        await client.telegram.sendChatAction(chatId, 'upload_photo');
        await client.telegram.sendPhoto(chatId, {
          url: picture,
          filename: _path.default.basename(picture)
        });
      }

      const keyboard = this.keyboardButtons(buttons);
      await client.telegram.sendMessage(chatId, `*${title}*\n${subtitle}`, _telegraf.Extra.markdown(true).markup(_telegraf.Markup.inlineKeyboard(keyboard)));
    }
  }

  keyboardButtons(arr) {
    if (!arr || !arr.length) {
      return undefined;
    }

    const rows = arr[0].length ? arr : [arr];
    return rows.map(row => row.map(x => {
      if (x.url) {
        return _telegraf.Markup.urlButton(x.title, x.url);
      }

      return _telegraf.Markup.callbackButton(x.title, x.payload);
    }));
  }

  parseTyping(typing) {
    if (isNaN(typing)) {
      return 1000;
    }

    return Math.max(typing, 500);
  }

}

exports.ReplyDefMethods = ReplyDefMethods;
//# sourceMappingURL=ReplyDefMethods.js.map