import r from 'ramda';
import db from './db';
import assert from './util/assert';

export default function(id) {
  return db('translation')
    .first('text')
    .where({id})
    .then(assert(`No translation text found for ${id}`))
    .then(r.prop('text'));
}
