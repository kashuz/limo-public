import {format as address} from '../../util/geo';
import {format as date} from '../../util/date';
import {format as cost} from '../../util/cost';
import plural from '../../util/plural';
import outdent from 'outdent';

function note(order) {
  return order.note ? `Notes: <i>${order.note}</i>` : ''
}

export default function(order) {
  return outdent`
    Заказ <b>№${order.id}</b>
    
    🔹 Адрес: ${order.location ? address(order.location) : 'не указан'}
    🔹 Машина: ${order.car || 'Любая машина'} класса ${order.category.name}
    🔹 Дата: ${date(order.date)}
    🔹 Время: В ${order.time} на ${order.duration} ${plural(order.duration, 'час', 'часа', 'часов')}
    🔹 Стоимость: ${cost(order.cost)}
    
    ${order.note ? `: <i>${order.note}</i>` : ''}`
}
