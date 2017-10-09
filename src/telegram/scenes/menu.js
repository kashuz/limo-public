import r from 'ramda';
import { Scene } from 'telegraf-flow';
import db from '../../db';
import action from '../action';
import vertical from '../keyboards/vertical';

const { reply, remove } = action('scene.menu.message');
const scene = new Scene('menu');

const keyboard = vertical({
  '🚘 New order': 'order',
  '🏷 Plans': 'plans',
  '📔 My orders': 'history',
  '☎️ Change phone': 'phone-number',
});

function create(user) {
  return db('order')
    .insert({ user_id: user })
    .returning('*')
    .then(r.head);
}

scene.enter(ctx => reply(ctx, 'Menu', keyboard));

scene.action('order', ctx =>
  create(ctx.user.id)
    .tap(() => remove(ctx))
    .then(order => ctx.flow.enter('order.create', { order })),
);

scene.action(/(.+)/, ctx =>
  ctx.answerCallbackQuery(`Not implemented ${ctx.match[1]}`),
);

scene.use((ctx, next) => reply(ctx, `Menu`, keyboard).then(next));

export default scene;
