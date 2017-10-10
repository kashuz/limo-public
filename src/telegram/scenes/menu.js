import r from 'ramda';
import {Scene} from 'telegraf-flow';
import db from '../../db';
import action from '../action';

const {reply, remove} = action('scene.menu.message');
const scene = new Scene('menu');

const extra = {
  reply_markup: {
    inline_keyboard: [
      [{text: '🚘 New order', callback_data: 'order'}],
      [{text: '🏷 Plans', callback_data: 'plans'}],
      [{text: '📔 My orders', callback_data: 'history'}],
      [{text: '☎️ Change phone', callback_data: 'phone-number'}]]}};

function create(user) {
  return db('order')
    .insert({user_id: user})
    .returning('*')
    .then(r.head);
}

scene.enter(ctx => reply(ctx, 'Menu', extra));

scene.action('order', ctx =>
  create(ctx.user.id)
    .tap(() => remove(ctx))
    .then(order => ctx.flow.enter('order.create', {order})));

scene.action(/(.+)/, ctx =>
  ctx.answerCallbackQuery(`Not implemented ${ctx.match[1]}`));

scene.use((ctx, next) =>
  reply(ctx, `Menu`, extra)
    .then(() => next()));

export default scene;
