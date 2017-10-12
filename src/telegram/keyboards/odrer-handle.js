import r from 'ramda';
import concat from '../../util/concat';
import compact from '../../util/compact';

export default function(order, cars, car) {
  return {
    parse_mode: 'html',
    reply_markup: {
      inline_keyboard: concat(compact([
        order.location &&
          [[{text: '📍 Show location', callback_data: `location.${order.id}`}]],
        cars && r.map(
          ([cl, cr]) => compact([
            {text: `${cl.id == car ? '◼️' : '◻️'} ${cl.name}`, callback_data: `car.${order.id}.${cl.id}`}, cr &&
            {text: `${cr.id == car ? '◼️' : '◻️'} ${cr.name}`, callback_data: `car.${order.id}.${cr.id}`}]),
          r.splitEvery(2, cars)),
        [[{text: '✅ Accept', callback_data: `accept.${order.id}`},
          {text: '❌ Reject', callback_data: `reject.${order.id}`}]]]))}};
}
