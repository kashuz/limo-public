export default function(ctx, next) {
  ctx.util = {
    removeKeyboard: () => ctx
      .reply('...', {reply_markup: {remove_keyboard: true}})
      .then(message => ctx.telegram
        .deleteMessage(ctx.chat.id, message.message_id))
  };

  return next();
}

