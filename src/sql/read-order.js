import db from '../db';

export default function(id) {
  return db('order')
    .where({'order.id': id})
    .leftJoin('car', 'car.id', 'order.car_id')
    .leftJoin('category', 'category.id', 'order.category_id')
    .first('order.*', 'car.name as car', 'category.name as category');
}
