import r from 'ramda';
import db from '../db';
import read from './read-order';

export default function(id, fields) {
  return db('order')
    .update({update_time: new Date(), ...fields})
    .where({id})
    .returning('id')
    .then(r.head)
    .then(read);
}
