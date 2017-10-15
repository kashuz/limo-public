import r from 'ramda';
import {format as address} from '../../util/geo';
import {format as date} from '../../util/date';

const rules = [
  ['location', 'Адрес: не указан', address],
  ['category', 'Машина: не выбрана', (category, {car}) => `${car || 'Любая машина'} класс: ${category}`],
  ['date', 'Дата: не указан', date],
  ['start_time', 'Время: не указана', (start, {finish_time: finish}) => `${start} - ${finish}, ${finish.split(':')[0] - start.split(':')[0]} час(ов)`],
  ['payment', 'Способ оплаты: не выбран', payment => (payment === 'payme' ? 'Payme' : 'Наличные')]];

function fields(order) {
  return r.join("\n", r.map(
    ([prop, empty, value]) =>
      order[prop]
        ? `🔹 ${value(order[prop], order)}`
        : `🔸 ${empty}`,
    rules));
}

function note(order) {
  return order.note ? `Notes: <i>${order.note}</i>` : ''
}

function status(order) {
  return {
    submitted: ' (submitted)',
    cancelled: ' (cancelled)',
    accepted: ' (accepted)',
    rejected: ' (rejected)',
    timedout: ' (timed out)',
    payment_cancelled: ' (payment cancelled)',
    payment_completed: ' (completed)',
  }[order.status] || ''
}

export default function(order) {
  return `Order <b>№${order.id}</b>${status(order)}

${fields(order)}

${note(order)}`
}
