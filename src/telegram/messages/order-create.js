import r from 'ramda';
import {format as address} from '../../util/geo';
import {format as date} from '../../util/date';
import {format as cost} from '../../util/cost';

const rules = [
  ['location',
    '🔸 Адрес: не указан',
    value => `🔹 ${address(value)}`],

  ['category',
    '🔸 Машина: не выбрана',
    (category, {car}) => `🔹 ${car || 'Любая машина'} класс: ${category}`],

  ['date',
    '🔸 Дата: не указана',
    value => `🔹 ${date(value)}`],

  ['start_time',
    '🔸 Время: не указано',
    (start, {duration}) => `🔹 В ${start} на ${duration} час(а/ов)`],

  ['phone_number',
    order => `🔹 Контактный номер: +${order.user.phone_number}`,
    value => `🔹 Контактный номер: ${value}`],

  ['payment',
    '🔸 Способ оплаты: не выбран',
    value => `🔹 ${value === 'payme' ? 'Payme' : 'Наличные'}`],

  ['cost',
    'Стоимость поездки не известна', value => `${cost(value)} сум`]];

function fields(order) {
  return r.join("\n", r.map(
    ([field, empty, filled]) =>
      order[field]
        ? `${filled(order[field], order)}`
        : `${typeof empty === 'function' 
                  ? empty(order)
                  : empty}`,
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
