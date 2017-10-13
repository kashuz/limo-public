import compact from '../../util/compact';

function ready(order) {
  return order.category_id && order.date && order.start_time && order.finish_time && order.payment;
}

export default function(order) {
  return {
    parse_mode: 'html',
    reply_markup: {
      inline_keyboard: compact([
        [{text: '📍 Location', callback_data: 'location'}],
        [{text: '🚗 Car', callback_data: 'car'}],
        [{text: '🗓 Date', callback_data: 'date'},
          {text: '⏰ Time', callback_data: 'start-time'}],
        [{text: `${order.payment === 'payme' ? '◼️' : '◻️'} Payme`, callback_data: 'payment.payme'},
          {text: `${order.payment === 'cash' ? '◼️' : '◻️'} Cash`, callback_data: 'payment.cash'}],
        [{text: '📝 Notes', callback_data: 'note'}],
        ready(order) &&
          [{text: '✅ Submit', callback_data: 'submit'}],
        [{text: '❌ Cancel', callback_data: 'cancel'}]])}};
}
