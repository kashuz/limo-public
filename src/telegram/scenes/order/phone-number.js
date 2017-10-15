import b from 'bluebird';
import {Scene} from 'telegraf-flow';
import update from '../../../sql/update-order';
import compact from '../../../util/compact';

const scene = new Scene('order.phone-number');
const key = 'scene.order.phone.message';

function extra(order) {
  return {
    reply_markup: {
      inline_keyboard: compact([
        order.phone_number &&
          [{text: '❌ Удалить контактный номер', callback_data: 'clear'}],
        [{text: '⬅ Back', callback_data: 'cancel'}]])}};
}

scene.enter(ctx => ctx.persistent.sendMessage(key,
  'Вы можете указать другой контактный номер для этого заказа. ' +
  'Пожалуйста введите номер или отправьте контакт.',
  extra(ctx.flow.state.order)));

scene.action('cancel', ctx => b.all([
  ctx.persistent.deleteMessage(key),
  ctx.flow.enter('order.create', {order: ctx.flow.state.order})]));

scene.on('text', ctx =>
  update(ctx.flow.state.order.id, {phone_number: ctx.message.text})
    .then(order => b.all([
      ctx.persistent.deleteMessage(key),
      ctx.flow.enter('order.create', {order})])));

scene.on('contact', ctx =>
  update(ctx.flow.state.order.id, {phone_number: ctx.message.contact.phone_number})
    .then(order => b.all([
      ctx.persistent.deleteMessage(key),
      ctx.flow.enter('order.create', {order})])));

scene.action('clear', ctx =>
  update(ctx.flow.state.order.id, {phone_number: null})
    .then(order => b.all([
      ctx.answerCallbackQuery('Контактный номер удален'),
      ctx.persistent.deleteMessage(key),
      ctx.flow.enter('order.create', {order})])));

scene.use((ctx, next) =>
  ctx.persistent.deleteMessage(key)
    .then(() => ctx.persistent.sendMessage(key,
      'Пожалуйста введите номер или отправьте контакт', extra(ctx.flow.state.order)))
    .then(() => next()));

export default scene;
