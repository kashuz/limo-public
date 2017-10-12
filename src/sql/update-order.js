import r from 'ramda';
import db from '../db';
import read from './read-order';

const clean = object => r.reduce(
  (acc, val) => val !== undefined
    ? r.assoc(val[0], val[1], acc)
    : acc,
  {}, r.toPairs(object));

export default function(id, fields) {
  return db('order')
    .update({update_time: new Date(), ...clean(fields)})
    .where({id})
    .returning('id')
    .then(r.head)
    .then(read);
}
