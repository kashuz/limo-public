import b from 'bluebird';
import r from 'ramda';
import { Scene } from 'telegraf-flow';
import { Extra as extra } from 'telegraf';
import { enabled } from '../../../util/geo';
import db from '../../../db';
import action from '../../action';

const { reply, reset } = action('scene.order.location.message');
const scene = new Scene('order.location');

const keyboard = extra.markup(m =>
  m.inlineKeyboard([m.callbackButton('⬅ Back', `cancel`)]),
);

function update(id, location) {
  return db('order')
    .update({ location })
    .where({ id })
    .returning('*')
    .then(r.head);
}

function pin(ctx, location) {
  return location
    ? ctx.replyWithLocation(location.latitude, location.longitude)
    : b.resolve();
}

scene.enter(ctx =>
  pin(ctx, ctx.flow.state.order.location).then(() =>
    reply(ctx, 'Please send location', keyboard),
  ),
);

scene.action('cancel', ctx =>
  b.all([
    reset(ctx),
    ctx.flow.enter('order.create', { order: ctx.flow.state.order }),
  ]),
);

scene.on('location', ctx =>
  enabled(ctx.message.location)
    .then(location => update(ctx.flow.state.order.id, location))
    .tap(() => ctx.reply('✅ Location saved'))
    .then(order =>
      b.all([reset(ctx), ctx.flow.enter('order.create', { order })]),
    )
    .catch(() =>
      reply(
        ctx,
        'This location is not supported. Please send another location',
        keyboard,
      ),
    ),
);

scene.use((ctx, next) =>
  reply(ctx, 'Please send location', keyboard).then(next),
);

export default scene;
