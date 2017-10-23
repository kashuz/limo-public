import compact from '../../util/compact';

export default function(order) {
  return {
    parse_mode: 'html',
    reply_markup: {
      inline_keyboard: compact([
        [{text: order.location ? '📍 Адрес подачи ✓' : '📍 Адрес подачи',
          callback_data: 'location'},
         {text: order.category_id ? '🚗 Машина ✓' : '🚗 Машина',
          callback_data: 'car'}],

        [{text: order.date ? '🗓 Дата ✓' : '🗓 Дата',
          callback_data: 'date'},
         {text: order.time ? '⏰ Время ✓' : '⏰ Время',
          callback_data: 'time'}],

        [{text: `${order.payment === 'payme' ? '◼️' : '◻️'} Payme ${order.payment === 'payme' ? '✓' : ''}`,
          callback_data: 'payment.payme'},
         {text: `${order.payment === 'cash' ? '◼️' : '◻️'} Наличные ${order.payment === 'cash' ? '✓' : ''}`,
          callback_data: 'payment.cash'}],

        [{text: order.note ? '📝 Комментарий ✓' : '📝 Комментарий',
          callback_data: 'note'},
         {text: (order.phone_number || order.user.phone_number) ? '☎️ Номер ✓' : '☎️ Номер',
          callback_data: 'phone-number'}],

        [{text: '✅ Отправить заказ',
          callback_data: 'submit'}],
        [{text: '❌ Отмена',
          callback_data: 'cancel'}]])}};
}
