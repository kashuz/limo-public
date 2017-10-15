import b from 'bluebird';
import {Scene} from 'telegraf-flow';
import message from '../../messages/order-create';
import progress from '../../messages/progress';
import translate from '../../../translate';
import persistent from '../../persistent';
import session from '../../../cache/session';
import ignore from '../../../util/ignore';
import update from '../../../sql/update-order';
import {submit} from '../../middlewares/group';

const scene = new Scene('order.await');

const back = {
  parse_mode: 'html',
  reply_markup: {
    inline_keyboard: [
      [{text: '🔁 Отправить заново', callback_data: 'retry'}],
      [{text: '➡ Главное меню', callback_data: 'menu'}]]}};

const forward = {
  parse_mode: 'html',
  reply_markup: {
    inline_keyboard: [[{text: '➡ Перейти к оплате', callback_data: 'payment'}]]}};

const key = status => ({
  timedout: 'scene.order.await.timeout',
  accepted: 'scene.order.await.accept',
  rejected: 'scene.order.await.reject'}[status]);

const text = status => ({
  timedout: 'order_timeout',
  accepted: 'order_accept',
  rejected: 'order_reject'}[status]);

const extra = status => ({
  timedout: back,
  accepted: forward,
  rejected: back}[status]);

scene.enter(ctx => persistent(ctx.telegram)
  .sendMessage(`order.${ctx.flow.state.order.id}.progress`,
    ctx.flow.state.order.user_id, progress(0)));

scene.action('menu', ctx => b.all([
  ctx.persistent.deleteMessage(key(ctx.flow.state.order.status)),
  ctx.flow.enter('menu')]));

scene.action('payment', ctx => b.all([
  ctx.persistent.deleteMessage(key(ctx.flow.state.order.status)),
  ctx.flow.enter('order.payment.payme', {order: ctx.flow.state.order})]));

scene.action('retry', ctx =>
  update(ctx.flow.state.order.id, {status: 'submitted', submit_time: new Date()})
    .tap(order => b.all([
      ctx.answerCallbackQuery('Заказ отправлен'),
      ctx.persistent.deleteMessage(key(ctx.flow.state.order.status)),
      ctx.persistent.editMessageText('scene.order.create.message', message(order), {parse_mode: 'html'}),
      submit(ctx.telegram, order)]))
    .then(order => ctx.flow.enter('order.await', {order})));

scene.use((ctx, next) =>
  (ctx.flow.state.order.status == 'submitted'
      ? persistent(ctx.telegram)
          .deleteMessage(`order.${ctx.flow.state.order.id}.progress`, ctx.flow.state.order.user_id)
          .catch(ignore(/message not found/i))
          .then(() => persistent(ctx.telegram)
            .sendMessage(`order.${ctx.flow.state.order.id}.progress`,
              ctx.flow.state.order.user_id, progress(0)))
      : ctx.persistent.deleteMessage(key(ctx.flow.state.order.status))
          .catch(ignore(/message not found/i))
          .then(() => translate(text(ctx.flow.state.order.status)))
          .then(text => ctx.persistent.sendMessage(
            key(ctx.flow.state.order.status), text, extra(ctx.flow.state.order.status))))
    .then(() => next()));

export default scene;

export function timeout(telegram, order) {
  return b.all([
    session(order.user_id)
      .set(['_flow', '_state', 'order'], order),
    persistent(telegram)
      .deleteMessage(`order.${order.id}.progress`, order.user_id),
    persistent(telegram, session(order.user_id))
      .editMessageText('scene.order.create.message',
        order.user_id, message(order), {parse_mode: 'html'}),
    translate(text('timedout')).then(text =>
      persistent(telegram, session(order.user_id))
        .sendMessage(key('timedout'), order.user_id, text, extra('timedout')))]);
}

export function accept(telegram, order) {
  return b.all([
    session(order.user_id)
      .set(['_flow', '_state', 'order'], order),
    persistent(telegram)
      .deleteMessage(`order.${order.id}.progress`, order.user_id),
    persistent(telegram, session(order.user_id))
      .editMessageText('scene.order.create.message',
        order.user_id, message(order), {parse_mode: 'html'}),
    translate(text('accepted')).then(text =>
      persistent(telegram, session(order.user_id))
        .sendMessage(key('accepted'), order.user_id, text, extra('accepted')))]);
}

export function reject(telegram, order) {
  return b.all([
    session(order.user_id)
      .set(['_flow', '_state', 'order'], order),
    persistent(telegram)
      .deleteMessage(`order.${order.id}.progress`, order.user_id),
    persistent(telegram, session(order.user_id))
      .editMessageText('scene.order.create.message',
        order.user_id, message(order), {parse_mode: 'html'}),
    translate(text('rejected')).then(text =>
      persistent(telegram, session(order.user_id))
        .sendMessage(key('rejected'), order.user_id, text, extra('rejected')))]);
}
