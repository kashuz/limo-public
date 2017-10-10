import r from 'ramda';
import db from './db';

export default function(user, id) {
  return db('translation')
    .first('text')
    .where({id})
    .then(r.prop('text'));
}
