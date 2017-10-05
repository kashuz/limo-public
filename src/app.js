import db from './db';
import './telegram/bot';

db('car')
  .select()
  .then(console.log.bind(console))
  .then(db.destroy.bind(db));
