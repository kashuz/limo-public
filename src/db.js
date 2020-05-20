const knex = require('knex');
const db = knex({
  client: 'pg',
  connection: {
    host : process.env.DATABASE_HOST,
    port : process.env.DATABASE_PORT,
    user : process.env.DATABASE_USER,
    password : process.env.DATABASE_PASSWORD,
    database : process.env.DATABASE
  },
  migrations: {tableName: 'migrations'},
  debug: process.env.DATABASE_DEBUG === 'true'});

module.exports = db;
