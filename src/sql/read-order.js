import db from '../db';

function nest(order) {
  const {
    user_first_name,
    user_last_name,
    user_phone_number,
    category_name,
    category_min_price,
    category_day_hour_price,
    category_night_hour_price,
    category_five_hours_price,
    category_twelve_hours_price, ...rest} = order;

  return {
    ...rest,
    user: {
      first_name: user_first_name,
      last_name: user_last_name,
      phone_number: user_phone_number},
    category: order.category_id && {
      name: category_name,
      min_price: category_min_price,
      day_hour_price: category_day_hour_price,
      night_hour_price: category_night_hour_price,
      five_hours_price: category_five_hours_price,
      twelve_hours_price: category_twelve_hours_price}}
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
      'category.name as category_name',
      'category.min_price as category_min_price',
      'category.day_hour_price as category_day_hour_price',
      'category.night_hour_price as category_night_hour_price',
      'category.five_hours_price as category_five_hours_price',
      'category.twelve_hours_price as category_twelve_hours_price',
      'user.first_name as user_first_name',
      'user.last_name as user_last_name',
      'user.phone_number as user_phone_number')
    .then(order => order && nest(order));
}
