import r from 'ramda';
import b from 'bluebird';
import {Scene} from 'telegraf-flow';
import message from '../../../messages/order-create';
import action from '../../../action';
import update from '../../../../sql/update-order';
import read from '../../../../sql/read-order';
import translate from '../../../../translate';

const {reset: rewrite} = action('scene.order.create.message');
const {reply, remove} = action('scene.order.payment.payme.message');

const scene = new Scene('order.payment.payme');

function invoice(order) {
  return {
    title: 'Оплата заказа',
    description: `Оплата за заказа №${order.id}`,
    payload: order.id,
    provider_token: process.env.PAYME_TOKEN,
    start_parameter: order.id,
    currency: 'UZS',
    prices: [{ label: 'Сумма заказа', amount: 140000 * 100 }],
    reply_markup: {inline_keyboard: [[{text: '✅ Оплатить', pay: true}]]}};
}

const extra = {
  reply_markup: {
    inline_keyboard: [[{text: '❌ Отменить заказ', callback_data: 'cancel'}]]}};

scene.enter(ctx =>
  ctx.replyWithInvoice(invoice(ctx.flow.state.order))
    .then(r.prop('message_id'))
    .then(id => ctx.session['scene.order.payment.payme.invoice'] = id)
    .then(() => reply(ctx, 'Пожалуйста оплатите заказ', extra)));

scene.action('cancel', ctx =>
  update(ctx.flow.state.order.id, {status: 'payment_cancelled', payment_time: new Date()})
    .then(order => b.all([
      remove(ctx),
      rewrite(ctx, message(order)),
      ctx.answerCallbackQuery('Заказа отменен'),
      ctx.telegram.deleteMessage(
        ctx.flow.state.order.user_id,
        ctx.session['scene.order.payment.payme.invoice']),
      ctx.flow.enter('menu')])));

scene.on("pre_checkout_query", ctx =>
  read(ctx.preCheckoutQuery.invoice_payload)
    .then(order => ctx.answerPreCheckoutQuery(!!order)));

scene.on("successful_payment", ctx =>
  update(ctx.message.successful_payment.invoice_payload,
      {status: 'completed', payment_time: new Date()})
    .then(order => b.all([
      rewrite(ctx, message(order)),
      remove(ctx),
      translate('order_pay')
        .then(text => ctx.telegram.sendMessage(order.user_id, text))
        .then(() => ctx.flow.enter('menu'))])));

scene.use((ctx, next) =>
  reply(ctx, 'Пожалуйста оплатите заказ', extra)
    .then(() => next()));

export default scene;
