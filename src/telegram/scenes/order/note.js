import b from 'bluebird';
import {Scene} from 'telegraf-flow';
import action from '../../action';
import update from '../../../sql/update-order';
import compact from '../../../util/compact';

const {reply, reset} = action('scene.order.note.message');
const scene = new Scene('order.note');

function extra(order) {
  return {
    reply_markup: {
      inline_keyboard: compact([
        order.note &&
          [{text: '❌ Remove notes', callback_data: 'clear'}],
        [{text: '⬅ Back', callback_data: 'cancel'}]])}};
}

scene.enter(ctx =>
  reply(ctx, 'Пожалуйста введите комментарий к заказу. Например: свадьба, встреча, аэропорт и т.д. Чем детальнее тем лучше.', extra(ctx.flow.state.order)));

scene.action('cancel', ctx => b.all([
  reset(ctx),
  ctx.flow.enter('order.create', {order: ctx.flow.state.order})]));

scene.on('text', ctx =>
  update(ctx.flow.state.order.id, {note: ctx.message.text})
    .then(order => b.all([
      reset(ctx),
      ctx.flow.enter('order.create', {order})])));

scene.action('clear', ctx =>
  update(ctx.flow.state.order.id, {note: null})
    .tap(() => ctx.answerCallbackQuery('Комментарии удалены'))
    .then(order => b.all([
      reset(ctx),
      ctx.flow.enter('order.create', {order})])));

scene.use((ctx, next) =>
  reply(ctx, 'Пожалуйста введите комментарий к заказу', extra(ctx.flow.state.order))
    .then(() => next()));

export default scene;
