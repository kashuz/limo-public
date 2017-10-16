import compact from '../../util/compact';

function ready(order) {
  return order.category_id
    && order.date
    && order.time
    && order.duration
    && order.payment;
}

export default function(order) {
  return {
    parse_mode: 'html',
    reply_markup: {
      inline_keyboard: compact([
        [{text: '📍 Адрес подачи', callback_data: 'location'},
         {text: '🚗 Машина', callback_data: 'car'}],
        [{text: '🗓 Дата', callback_data: 'date'},
         {text: '⏰ Время', callback_data: 'time'}],
        [{text: `${order.payment === 'payme' ? '◼️' : '◻️'} Payme`, callback_data: 'payment.payme'},
         {text: `${order.payment === 'cash' ? '◼️' : '◻️'} Наличные`, callback_data: 'payment.cash'}],
        [{text: '📝 Комментарий', callback_data: 'note'},
         {text: '☎️ Номер', callback_data: 'phone-number'}],
        ready(order) &&
          [{text: '✅ Отправить заказ', callback_data: 'submit'}],
        [{text: '❌ Отмена', callback_data: 'cancel'}]])}};
}
