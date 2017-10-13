import b from 'bluebird';
import {Scene} from 'telegraf-flow';
import action from '../../action';
import update from '../../../sql/update-order';
import message from '../../messages/order-create';
import extra from '../../keyboards/order-create';
import {submit} from '../../middlewares/group';

const {reply, reset, remove} = action('scene.order.create.message');
const scene = new Scene('order.create');

scene.enter(ctx =>
  reply(ctx, message(ctx.flow.state.order), extra(ctx.flow.state.order)));

scene.action(/(location|car|date|start-time|note)/, ctx => b.all([
  remove(ctx),
  ctx.flow.enter(`order.${ctx.match[1]}`, {order: ctx.flow.state.order})]));

scene.action(/payment\.(payme|cash)/, ctx =>
  update(ctx.flow.state.order.id, {payment: ctx.match[1]})
    .then(order => ctx.flow.state.order = order)
    .then(order => ctx.editMessageText(message(order), extra(order))));

scene.action('cancel', ctx =>
  update(ctx.flow.state.order.id, {status: 'cancelled'})
    .tap(() => ctx.answerCallbackQuery('Заказ отменен').catch(() => {}))
    .then(order => b.all([
      reset(ctx, message(order)),
      ctx.flow.enter('menu')])));

scene.action('submit', ctx =>
  update(ctx.flow.state.order.id, {status: 'submitted', submit_time: new Date()})
    .tap(() => ctx.answerCallbackQuery('Заказ отправлен').catch(() => {}))
    .tap(order => b.all([
      reset(ctx, message(order)),
      submit(ctx.telegram, order)]))
    .then(order => ctx.flow.enter('order.await', {order})));

scene.use((ctx, next) =>
  reply(ctx, message(ctx.flow.state.order), extra(ctx.flow.state.order))
    .then(() => next()));

export default scene;
