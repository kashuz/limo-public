import create from './order-create';

function status(order) {
  return order.status ? `` : '';
}

export default function(order) {
  return `${create(order).trim()}

Status: ${order.status}
Client: ${order.first_name} ${order.last_name} +${order.phone_number}
`
}
