import r from 'ramda';
import db from '../db';
import read from './read-order';
import assert from '../util/assert';
import calc from '../util/cost';

const clean = object => r.reduce(
  (acc, val) => val !== undefined
    ? r.assoc(val[0], val[1], acc)
    : acc,
  {}, r.toPairs(object));

function cost(fields, order) {
  return r.union(['time', 'category_id', 'duration'], fields).length &&
         order.time && order.category && order.duration
    ? db('order')
        .update({cost: calc(order.category, order.time, order.duration)})
        .where({id: order.id})
        .returning('id')
        .then(r.head)
        .then(read)
    : order;
}

export default function update(id, fields, condition) {
  const q = db('order')
    .update({update_time: new Date(), ...clean(fields)})
    .where({id});

  if (condition) {
    if (typeof condition === 'function')
      condition(q);
    else
      q.andWhere(condition);
  }

  return q
    .returning('id')
    .then(r.head)
    .then(assert('No orders affected'))
    .then(read)
    .then(r.partial(cost, [fields]));
}
