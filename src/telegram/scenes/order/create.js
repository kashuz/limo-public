import b from 'bluebird';
import {Scene} from 'telegraf-flow';
import action from '../../action';
import {format as address} from '../../../util/geo';
import {format as date} from '../../../util/date';
import update from '../../../sql/update-order';
import compact from '../../../util/compact';

const {reply, reset} = action('scene.order.create.message');
const scene = new Scene('order.create');

function ready(o) {
  return o.location &&
         o.category_id &&
         o.date &&
         o.start_time &&
         o.finish_time &&
         o.payment;
}

function extra(o) {
  return {
    parse_mode: 'html',
    reply_markup: {
      inline_keyboard: compact([
        ready(o) &&
          [{text: '🚀 Submit', callback_data: 'submit'}],
        [{text: '📍 Location', callback_data: 'location'}],
        [{text: '🚗 Car', callback_data: 'car'}],
        [{text: '🗓 Date', callback_data: 'date'},
         {text: '⏰ Time', callback_data: 'start-time'}],
        [{text: `${o.payment === 'payme' ? '◼️' : '◻️'} Payme`, callback_data: 'payment.payme'},
         {text: `${o.payment === 'cash' ? '◼️' : '◻️'} Cash`, callback_data: 'payment.cash'}],
        [{text: '📝 Notes', callback_data: 'note'}],
        [{text: '❌ Cancel', callback_data: 'cancel'}]])}};
}

const props = [
  ['location', 'Location: not set', address],
  ['category', 'Car: not set', (category, {car}) => `${car || 'Random car'} from class ${category}`],
  ['date', 'Date: not set', date],
  ['start_time', 'Time: not set', (start, {finish_time: finish}) => `${start} - ${finish}, ${finish.split(':')[0] - start.split(':')[0]} hour(s)`],
  ['payment', 'Payment method: not set', payment => (payment === 'payme' ? 'Payme' : 'Cash')]];

function format(o) {
  return `Order <b>#${o.id}</b>\n\n` +
    props.map(([prop, empty, value]) =>
      (o[prop] ? '✅ ' : '⭕️ ') + (o[prop] ? value(o[prop], o) : empty)).join(`\n`) +
    (o.note ? `\n\nNotes: <i>${o.note}</i>` : '');
}

scene.enter(ctx =>
  reply(ctx, format(ctx.flow.state.order), extra(ctx.flow.state.order)));

scene.action(/(location|car|date|start-time|note)/, ctx => b.all([
  ctx.deleteMessage(),
  ctx.flow.enter(`order.${ctx.match[1]}`, {order: ctx.flow.state.order})]));

scene.action(/payment\.(payme|cash)/, ctx =>
  update(ctx.flow.state.order.id, {payment: ctx.match[1]})
    .then(order => ctx.flow.state.order = order)
    .then(order => ctx.editMessageText(format(order), extra(order))));

scene.action('cancel', ctx =>
  update(ctx.flow.state.order.id, {status: 'cancelled'})
    .then(() => ctx.reply('Order cancelled'))
    .then(() => b.all([
      reset(ctx),
      ctx.flow.enter('menu')])));

scene.use((ctx, next) =>
  reply(ctx, format(ctx.flow.state.order), extra(ctx.flow.state.order))
    .then(() => next()));

export default scene;
