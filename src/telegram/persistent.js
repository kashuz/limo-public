import redis from '../cache/redis';
import assert from '../util/assert';

export default function(telegram, cache = redis) {
  return {
    sendMessage: (key, ...args) => telegram.sendMessage(...args)
      .tap(message => cache.set(key, message.message_id)),

    forwardMessage: (key, ...args) => telegram.forwardMessage(...args)
      .tap(message => cache.set(key, message.message_id)),

    sendPhoto: (key, ...args) => telegram.sendPhoto(...args)
      .tap(message => cache.set(key, message.message_id)),

    sendAudio: (key, ...args) => telegram.sendAudio(...args)
      .tap(message => cache.set(key, message.message_id)),

    sendDocument: (key, ...args) => telegram.sendDocument(...args)
      .tap(message => cache.set(key, message.message_id)),

    sendVideo: (key, ...args) => telegram.sendVideo(...args)
      .tap(message => cache.set(key, message.message_id)),

    sendVoice: (key, ...args) => telegram.sendVoice(...args)
      .tap(message => cache.set(key, message.message_id)),

    sendVideoNote: (key, ...args) => telegram.sendVideoNote(...args)
      .tap(message => cache.set(key, message.message_id)),

    sendLocation: (key, ...args) => telegram.sendLocation(...args)
      .tap(message => cache.set(key, message.message_id)),

    sendVenue: (key, ...args) => telegram.sendVenue(...args)
      .tap(message => cache.set(key, message.message_id)),

    sendContact: (key, ...args) => telegram.sendContact(...args)
      .tap(message => cache.set(key, message.message_id)),

    sendSticker: (key, ...args) => telegram.sendSticker(...args)
      .tap(message => cache.set(key, message.message_id)),

    sendInvoice: (key, ...args) => telegram.sendInvoice(...args)
      .tap(message => cache.set(key, message.message_id)),

    sendGame: (key, ...args) => telegram.sendGame(...args)
      .tap(message => cache.set(key, message.message_id)),

    editMessageText: (key, chat, text, extra) => cache.get(key)
      .then(assert('editMessageText: Message not found'))
      .then(message => telegram.editMessageText(chat, message, undefined, text, extra)),

    editMessageCaption: (key, chat, caption, markup) => cache.get(key)
      .then(assert('editMessageCaption: Message not found'))
      .then(message => telegram.editMessageCaption(chat, message, undefined, caption, markup)),

    editMessageReplyMarkup: (key, chat, markup) => cache.get(key)
      .then(assert('editMessageReplyMarkup: Message not found'))
      .then(message => telegram.editMessageReplyMarkup(chat, message, undefined, markup)),

    deleteMessage: (key, chat) => cache.get(key)
      .then(assert('deleteMessage: Message not found'))
      .then(message => telegram.deleteMessage(chat, message))
      .tap(() => cache.del(key)),
  }
}
