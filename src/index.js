require('dotenv').config();
const db = require('./db').default;

db('car')
  .select()
  .then(console.log.bind(console))
  .then(db.destroy.bind(db));
