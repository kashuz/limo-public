import b from 'bluebird';
import {Scene} from 'telegraf-flow';
import update from '../../../sql/update-order';
import message from '../../messages/order-create';
import extra from '../../keyboards/order-create';
import {submit} from '../../middlewares/group';

const scene = new Scene('order.create');
const key = 'scene.order.create.message';

scene.enter(ctx => ctx.persistent
  .sendMessage(key, message(ctx.flow.state.order), extra(ctx.flow.state.order)));

scene.action(/(car|date|note|location|time|phone-number)/, ctx => b.all([
  ctx.persistent.deleteMessage(key),
  ctx.flow.enter(`order.${ctx.match[1]}`, {order: ctx.flow.state.order})]));

scene.action(/payment\.(payme|cash)/, ctx =>
  update(ctx.flow.state.order.id, {payment: ctx.match[1]})
    .then(order => ctx.flow.state.order = order)
    .then(order => b.all([
      ctx.answerCallbackQuery('Способ оплаты выбран'),
      ctx.persistent.editMessageText(key, message(order), extra(order))])));

scene.action('cancel', ctx =>
  update(ctx.flow.state.order.id, {status: 'cancelled'})
    .then(order => b.all([
      ctx.answerCallbackQuery('Заказ отменен'),
      ctx.persistent.editMessageText(key, message(order), {parse_mode: 'html'}),
      ctx.flow.enter('menu')])));

scene.action('submit', ctx =>
  update(ctx.flow.state.order.id, {status: 'submitted', submit_time: new Date()})
    .tap(order => b.all([
      ctx.answerCallbackQuery('Заказ отправлен'),
      ctx.persistent.editMessageText(key, message(order), {parse_mode: 'html'}),
      submit(ctx.telegram, order)]))
    .then(order => ctx.flow.enter('order.await', {order})));

scene.use((ctx, next) =>
  ctx.persistent.deleteMessage(key)
    .then(() => ctx.persistent.sendMessage(key,
      message(ctx.flow.state.order), extra(ctx.flow.state.order)))
    .then(() => next()));

export default scene;
