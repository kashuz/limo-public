import b from 'bluebird';
import {Scene} from 'telegraf-flow';
import create from '../../sql/create-order';

const scene = new Scene('menu');
const key = 'scene.menu.message';

const extra = {
  reply_markup: {
    inline_keyboard: [
      [{text: '🚘 Сделать заказ', callback_data: 'order'}],
      [{text: '🏷 Тарифы', callback_data: 'plans'}],
      [{text: '📔 Мои заказы', callback_data: 'history'}],
      [{text: '☎️ Изменить номер ', callback_data: 'phone-number'}]]}};

scene.enter(ctx => ctx.persistent
  .sendMessage(key, 'Главное меню', extra));

scene.action('order', ctx => b.all([
  ctx.persistent.deleteMessage(key),
  create({user_id: ctx.user.id})
    .then(order => ctx.flow.enter('order.create', {order}))]));

scene.action('plans', ctx => b.all([
  ctx.persistent.deleteMessage(key),
  ctx.flow.enter('plans')]));

scene.action(/(.+)/, ctx =>
  ctx.answerCallbackQuery(`Не реализован ${ctx.match[1]}`));

scene.use((ctx, next) =>
  ctx.persistent.deleteMessage(key)
    .then(() => ctx.persistent
      .sendMessage(key, 'Главное меню', extra))
    .then(() => next()));

export default scene;
