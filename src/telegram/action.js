import r from 'ramda';

function remove(key, ctx) {
  return new Promise(resolve => {
    if (ctx.session[key])
      ctx.telegram
        .deleteMessage(ctx.user.id, ctx.session[key])
        .then(resolve, resolve);

    resolve()});
}

function reset(key, ctx, text) {
  return new Promise(resolve => {
    if (ctx.session[key])
      return text
        ? ctx.telegram
          .editMessageText(ctx.user.id, ctx.session[key], undefined, text,
            {parse_mode: 'html', reply_markup: {inline_keyboard: []}})
          .then(resolve, resolve)
        : ctx.telegram
          .editMessageReplyMarkup(ctx.user.id, ctx.session[key],
            {parse_mode: 'html', reply_markup: {inline_keyboard: []}})
          .then(resolve, resolve);

    resolve()});
}

function reply(key, ctx, text, extra) {
  return reset(key, ctx)
    .then(() => ctx.reply(text, extra))
    .then(result => ctx.session[key] = result.message_id);
}

export default function(key) {
  return {
    reply: r.partial(reply, [key]),
    reset: r.partial(reset, [key]),
    remove: r.partial(remove, [key])};
}
