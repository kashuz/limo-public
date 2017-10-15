import b from 'bluebird';
import {Scene} from 'telegraf-flow';
import update from '../../../sql/update-order';
import compact from '../../../util/compact';

const scene = new Scene('order.note');
const key = 'scene.order.note.message';

function extra(order) {
  return {
    reply_markup: {
      inline_keyboard: compact([
        order.note &&
          [{text: '❌ Remove notes', callback_data: 'clear'}],
        [{text: '⬅ Back', callback_data: 'cancel'}]])}};
}

scene.enter(ctx => ctx.persistent.sendMessage(key,
  'Пожалуйста введите комментарий к заказу. ' +
  'Например: свадьба, встреча, аэропорт и т.д. ' +
  'Чем детальнее тем лучше.',
  extra(ctx.flow.state.order)));

scene.action('cancel', ctx => b.all([
  ctx.persistent.deleteMessage(key),
  ctx.flow.enter('order.create', {order: ctx.flow.state.order})]));

scene.on('text', ctx =>
  update(ctx.flow.state.order.id, {note: ctx.message.text})
    .then(order => b.all([
      ctx.persistent.deleteMessage(key),
      ctx.flow.enter('order.create', {order})])));

scene.action('clear', ctx =>
  update(ctx.flow.state.order.id, {note: null})
    .then(order => b.all([
      ctx.answerCallbackQuery('Комментарии удалены'),
      ctx.persistent.deleteMessage(key),
      ctx.flow.enter('order.create', {order})])));

scene.use((ctx, next) =>
  ctx.persistent.deleteMessage(key)
    .then(() => ctx.persistent.sendMessage(key,
      'Пожалуйста введите комментарий к заказу', extra(ctx.flow.state.order)))
    .then(() => next()));

export default scene;
