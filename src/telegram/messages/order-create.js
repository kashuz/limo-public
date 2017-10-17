import r from 'ramda';
import {format as address} from '../../util/geo';
import {format as date} from '../../util/date';
import {format as cost} from '../../util/cost';
import plural from '../../util/plural';
import outdent from 'outdent';

const rules = [
  ['location',
    '🔸 Адрес: не указан',
    value => `🔹 ${address(value)}`],

  ['category_id',
    '🔸 Машина: не выбрана',
    (_, {category, car}) => `🔹 ${car || 'Любая машина'} класса ${category.name}`],

  ['date',
    '🔸 Дата: не указана',
    value => `🔹 ${date(value)}`],

  ['time',
    '🔸 Время: не указано',
    (start, {duration}) => `🔹 В ${start} на ${duration} ${plural(duration, 'час', 'часа', 'часов')}`],

  ['phone_number',
    order => `🔹 Контактный номер: +${order.user.phone_number}`,
    value => `🔹 Контактный номер: ${value}`],

  ['payment',
    '🔸 Способ оплаты: не выбран',
    value => `🔹 ${value === 'payme' ? 'Payme' : 'Наличные'}`],

  ['cost',
    '🔸 Стоимость поездки не известна', value => `🔹 ${cost(value)}`]];

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
    submitted: ' (отправлен)',
    cancelled: ' (отменен)',
    accepted: ' (принят)',
    rejected: ' (отклонен)',
    timedout: ' (просрочен)',
    payment_cancelled: ' (платеж отменен)',
    payment_completed: ' (успешно)',
  }[order.status] || ''
}

export function errors(order) {
  const errors = [];

  if (!order.category_id)
    errors.push('Выбрать машину');

  if (!order.date && !order.duration)
    errors.push('Выбрать дату и время');
  else if (!order.date)
    errors.push('Выбрать дату');
  else if (!order.duration)
    errors.push('Выбрать время');

  if (!order.payment)
    errors.push('Выбрать способ оплаты');

  return errors.length
    ? outdent`Для отправки заказа вам необходимо:
      
      ${errors.map(e => ` • ${e}`).join("\n")}`
    : undefined;
}

export default function(order) {
  return `Order <b>№${order.id}</b>${status(order)}

${fields(order)}

${note(order)}`
}
