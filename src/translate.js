import r from 'ramda';
import db from './db';

export default function(id) {
  return db('translation')
    .first('text')
    .where({id})
    .then(r.propOr(`⚠ Текст для "${id}" не определен`, 'text'));
}

export function photo(id) {
  return db('translation')
    .pluck('photo')
    .where({id})
    .then(r.head)
    .then(photo => photo || {source: __dirname + '/../resources/no-photo.png'});
}
