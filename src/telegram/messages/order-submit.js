import r from 'ramda';
import create from './order-create';

export default function(order) {
  return r.pipe(
    r.trim,
    r.split("\n"),
    r.insert(1, `${order.first_name || ''} ${order.last_name || ''} +${order.phone_number}`),
    r.join("\n"))
  (create(order))
}
