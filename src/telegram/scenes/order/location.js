import b from 'bluebird';
import r from 'ramda';
import { Scene } from 'telegraf-flow';
import { enabled } from '../../../util/geo';
import db from '../../../db';
import action from '../../action';

const { reply, reset } = action('scene.order.location.message');
const scene = new Scene('order.location');

const extra = {
  reply_markup: {
    inline_keyboard: [[{ text: '⬅ Back', callback_data: 'cancel' }]],
  },
};

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
    reply(ctx, 'Please send location', extra),
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
        extra,
      ),
    ),
);

scene.use((ctx, next) => reply(ctx, 'Please send location', extra).then(next));

export default scene;
