import r from 'ramda';
import concat from '../../util/concat';
import compact from '../../util/compact';

export default function(order, cars, car) {
  return {
    parse_mode: 'html',
    reply_markup: {
      inline_keyboard: concat(compact([
        order.location &&
          [[{text: '📍 Показать локацию подачи', callback_data: `location.${order.id}`}]],
        cars && r.splitEvery(1, r.map(
          c => ({text: `${c.id === car ? '◼️' : '◻️'} ${c.name}`,
                 callback_data: `car.${order.id}.${c.id}`}),
          cars)),
        [[{text: '✅ Принять', callback_data: `accept.${order.id}`},
          {text: '❌ Отказать', callback_data: `reject.${order.id}`}]]]))}};
}
