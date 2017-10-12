import r from 'ramda';
import db from './db';
import assert from './util/assert';

export default function(id) {
  return db('translation')
    .first('text')
    .then(assert(`No translation text found for ${id}`))
    .where({id})
    .then(r.prop('text'));
}
