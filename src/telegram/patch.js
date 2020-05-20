import Context from 'telegraf/context';
import Telegram from 'telegraf/telegram';
import ignore from '../util/ignore';

Object.defineProperty(Context.prototype, 'from', {
  get: function() {
    return (this.message && this.message.from) ||
      (this.editedMessage && this.editedMessage.from) ||
      (this.callbackQuery && this.callbackQuery.from) ||
      (this.inlineQuery && this.inlineQuery.from) ||
      (this.channelPost && this.channelPost.from) ||
      (this.editedChannelPost && this.editedChannelPost.from) ||
      (this.chosenInlineResult && this.chosenInlineResult.from) ||
      (this.shippingQuery && this.shippingQuery.from) ||
      (this.preCheckoutQuery && this.preCheckoutQuery.from)
  }
});

const editMessageText = Telegram.prototype.editMessageText;
Telegram.prototype.editMessageText = function(...args) {
  return editMessageText.call(this, ...args)
    .catch(ignore(/message is not modified/i));
};

const editMessageReplyMarkup = Telegram.prototype.editMessageReplyMarkup;
Telegram.prototype.editMessageReplyMarkup = function(...args) {
  return editMessageReplyMarkup.call(this, ...args)
    .catch(ignore(/message is not modified/i));
};

const deleteMessage = Telegram.prototype.deleteMessage;
Telegram.prototype.deleteMessage = function(...args) {
  return deleteMessage.call(this, ...args)
    .catch(ignore([
      /message to delete not found/i,
      /message can't be deleted/i]));
};

const answerCallbackQuery = Telegram.prototype.answerCallbackQuery;
Telegram.prototype.answerCallbackQuery = function(...args) {
  return answerCallbackQuery.call(this, ...args)
    .catch(ignore(/query_id_invalid/i));
};
