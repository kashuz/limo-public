import b from 'bluebird';
import {Scene} from 'telegraf-flow';
import message from '../../../messages/order-create';
import update from '../../../../sql/update-order';
import read from '../../../../sql/read-order';
import translate from '../../../../translate';
import {cancel, complete} from "../../../middlewares/group";

const scene = new Scene('order.payment.payme');

const inv = 'scene.order.payment.payme.invoice';
const cnl = 'scene.order.payment.payme.message';
const ord = 'scene.order.create.message';

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

scene.enter(ctx => ctx.persistent.sendInvoice(inv, invoice(ctx.flow.state.order))
  .then(() => ctx.persistent.sendMessage(cnl, 'Пожалуйста оплатите заказ', extra)));

scene.action('cancel', ctx =>
  update(ctx.flow.state.order.id, {status: 'payment_cancelled', payment_time: new Date()})
    .then(order => b.all([
      ctx.answerCallbackQuery('Заказа отменен'),
      ctx.persistent.deleteMessage(inv),
      ctx.persistent.deleteMessage(cnl),
      ctx.persistent.editMessageText(ord, message(order), {parse_mode: 'html'}),
      cancel(ctx.telegram, order),
      ctx.flow.enter('menu')])));

scene.on("pre_checkout_query", ctx =>
  read(ctx.preCheckoutQuery.invoice_payload)
    .then(order => ctx.answerPreCheckoutQuery(!!order)));

scene.on("successful_payment", ctx =>
  update(ctx.message.successful_payment.invoice_payload, {status: 'payment_completed', payment_time: new Date()})
    .then(order => b.all([
      ctx.persistent.editMessageText(ord, message(order), {parse_mode: 'html'}),
      ctx.persistent.deleteMessage(cnl),
      complete(ctx.telegram, order),
      translate('order_pay')
        .then(text => ctx.telegram.sendMessage(order.user_id, text))
        .then(() => ctx.flow.enter('menu'))])));

scene.use((ctx, next) =>
  ctx.persistent.deleteMessage(cnl)
    .then(() => ctx.persistent.sendMessage(cnl,
      'Пожалуйста оплатите заказ', extra))
    .then(() => next()));
export default scene;
