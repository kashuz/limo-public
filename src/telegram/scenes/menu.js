import b from 'bluebird';
import {Scene} from 'telegraf-flow';
import create from '../../sql/create-order';
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

scene.enter(ctx => reply(ctx, 'Menu', extra));

scene.action('order', ctx => b.all([
  remove(ctx),
  create({user_id: ctx.user.id})
    .then(order => ctx.flow.enter('order.create', {order}))]));

scene.action('plans', ctx => b.all([
  remove(ctx),
  ctx.flow.enter('plans')]));

scene.action(/(.+)/, ctx =>
  ctx.answerCallbackQuery(`Not implemented ${ctx.match[1]}`));

scene.use((ctx, next) =>
  reply(ctx, `Menu`, extra)
    .then(() => next()));

export default scene;
