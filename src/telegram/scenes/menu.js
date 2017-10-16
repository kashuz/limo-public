import b from 'bluebird';
import {Scene} from 'telegraf-flow';
import create from '../../sql/create-order';
import compact from '../../util/compact';

const scene = new Scene('menu');
const key = 'scene.menu.message';

const extra = admin => ({
  reply_markup: {
    inline_keyboard: compact([
      [{text: '🚘 Сделать заказ', callback_data: 'order'}],
      [{text: '🏷 Тарифы', callback_data: 'plans'}],
      [{text: '📔 Мои заказы', callback_data: 'history'}],
      [{text: '☎️ Изменить номер ', callback_data: 'phone-number'}],
      admin &&
        [{text: '⚙️ Админ', callback_data: 'admin'}]])}});

scene.enter(ctx => ctx.persistent
  .sendMessage(key, 'Главное меню', extra(ctx.user.admin)));

scene.action('order', ctx => b.all([
  ctx.persistent.deleteMessage(key),
  create({user_id: ctx.user.id})
    .then(order => ctx.flow.enter('order.create', {order}))]));

scene.action('plans', ctx => b.all([
  ctx.persistent.deleteMessage(key),
  ctx.flow.enter('plans')]));

scene.action('admin', ctx => b.all([
  ctx.persistent.deleteMessage(key),
  ctx.flow.enter('admin.menu')]));

scene.action(/(.+)/, ctx =>
  ctx.answerCallbackQuery(`Не реализован ${ctx.match[1]}`));

scene.use((ctx, next) =>
  ctx.persistent.deleteMessage(key)
    .then(() => ctx.persistent
      .sendMessage(key, 'Главное меню', extra(ctx.user.admin)))
    .then(() => next()));

export default scene;
