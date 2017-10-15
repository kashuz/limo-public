import db from '../db';

function nest(order) {
  const {
    user_first_name,
    user_last_name,
    user_phone_number, ...rest} = order;

  return {
    ...rest,
    user: {
      first_name: user_first_name,
      last_name: user_last_name,
      phone_number: user_phone_number}}
}

export default function(id) {
  return db('order')
    .where({'order.id': id})
    .leftJoin('car', 'car.id', 'order.car_id')
    .leftJoin('category', 'category.id', 'order.category_id')
    .leftJoin('user', 'user.id', 'order.user_id')
    .first(
      'order.*',
      'car.name as car',
      'category.name as category',
      'user.first_name as user_first_name',
      'user.last_name as user_last_name',
      'user.phone_number as user_phone_number')
    .then(order => order && nest(order));
}
