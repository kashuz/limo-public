import b from 'bluebird';
import {Scene} from 'telegraf-flow';
import message from '../../../messages/order-create';
import update from '../../../../sql/update-order';
import translate from '../../../../translate';
import {cancel, complete} from '../../../middlewares/group';

const scene = new Scene('order.payment.cash');

const key = 'scene.order.payment.cash.message';
const ord = 'scene.order.create.message';

const extra = {
  reply_markup: {
    inline_keyboard: [[
      {text: '❌ Отменить заказ', callback_data: 'cancel'},
      {text: '✅ ОК', callback_data: 'ok'}]]}};

scene.enter(ctx => translate('order_cash')
  .then(text => ctx.persistent.sendMessage(key, text, extra)));

scene.action('cancel', ctx =>
  update(ctx.flow.state.order.id, {status: 'payment_cancelled', payment_time: new Date()})
    .then(order => b.all([
      ctx.answerCallbackQuery('Заказа отменен'),
      ctx.persistent.editMessageText(ord, message(order), {parse_mode: 'html'}),
      ctx.persistent.deleteMessage(key),
      ctx.flow.enter('menu'),
      cancel(ctx.telegram, order)])));

scene.action('ok', ctx =>
  update(ctx.flow.state.order.id, {status: 'payment_completed', payment_time: new Date()})
    .then(order => b.all([
      ctx.persistent.editMessageText(ord, message(order), {parse_mode: 'html'}),
      ctx.persistent.deleteMessage(key),
      ctx.flow.enter('menu'),
      complete(ctx.telegram, order)])));

scene.use((ctx, next) =>
  ctx.persistent.deleteMessage(key)
    .then(() => translate('order_cash'))
    .then(text => ctx.persistent.sendMessage(key, text, extra))
    .then(() => next()));

export default scene;
