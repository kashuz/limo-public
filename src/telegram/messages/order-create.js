import r from 'ramda';
import {format as address} from '../../util/geo';
import {format as date} from '../../util/date';

const rules = [
  ['location', 'Location: not set', address],
  ['category', 'Car: not set', (category, {car}) => `${car || 'Random car'} from class ${category}`],
  ['date', 'Date: not set', date],
  ['start_time', 'Time: not set', (start, {finish_time: finish}) => `${start} - ${finish}, ${finish.split(':')[0] - start.split(':')[0]} hour(s)`],
  ['payment', 'Payment method: not set', payment => (payment === 'payme' ? 'Payme' : 'Cash')]];

function fields(order) {
  return r.join("\n", r.map(
    ([prop, empty, value]) =>
      order[prop]
        ? `✅ ${value(order[prop], order)}`
        : `⭕️ ${empty}`,
    rules));
}

function note(order) {
  return order.note ? `Notes: <i>${order.note}</i>` : ''
}

export default function(order) {
  return `Order <b>№${order.id}</b>\n\n${fields(order)}\n\n${note(order)}`
}
