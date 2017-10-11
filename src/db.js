const knex = require('knex');

const db = knex({
  client: 'pg',
  connection: process.env.DATABASE_URL,
  migrations: {tableName: 'migrations'},
  debug: process.env.DATABASE_DEBUG === 'true'});

module.exports = db;
