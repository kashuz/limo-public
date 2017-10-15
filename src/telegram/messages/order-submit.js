import r from 'ramda';
import create from './order-create';

export default function(order) {
  return r.pipe(
    r.trim,
    r.split(`\n`),
    r.insert(2, `🔹 Клиент: ${order.user.first_name || ''} ${order.user.last_name || ''}`),
    r.join(`\n`))
  (create(order))
}
