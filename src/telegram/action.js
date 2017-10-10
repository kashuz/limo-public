import r from 'ramda';

function remove(key, ctx) {
  return new Promise(resolve => {
    if (ctx.session[key])
      ctx.telegram
        .deleteMessage(ctx.user.id, ctx.session[key])
        .then(resolve, resolve);

    resolve();
  });
}

function reset(key, ctx) {
  return new Promise(resolve => {
    if (ctx.session[key])
      ctx.tg
        .editMessageReplyMarkup(ctx.user.id, ctx.session[key], {
          reply_markup: { remove_keyboard: true },
        })
        .then(resolve, resolve);

    resolve();
  });
}

function reply(key, ctx, text, extra) {
  return reset(key, ctx)
    .then(() => ctx.reply(text, extra))
    .then(result => {
      ctx.session[key] = result.message_id;
    });
}

export default function(key) {
  return {
    reply: r.partial(reply, [key]),
    reset: r.partial(reset, [key]),
    remove: r.partial(remove, [key]),
  };
}
