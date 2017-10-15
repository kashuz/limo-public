import Context from 'telegraf/lib/core/context';
import Telegram from 'telegraf/lib/telegram';
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

const deleteMessage = Telegram.prototype.deleteMessage;
Telegram.prototype.deleteMessage = function(...args) {
  return deleteMessage.call(this, ...args)
    .catch(ignore(/message to delete not found/i));
};

const answerCallbackQuery = Telegram.prototype.answerCallbackQuery;
Telegram.prototype.answerCallbackQuery = function(...args) {
  return answerCallbackQuery.call(this, ...args)
    .catch(ignore(/query_id_invalid/i));
};
