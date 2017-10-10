import r from 'ramda';
import db from '../db';
import read from './read-order';

export default function (fields) {
  return db('order')
    .insert({
      create_time: new Date(),
      update_time: new Date(),
      ...fields})
    .returning('id')
    .then(r.head)
    .then(read);
}
