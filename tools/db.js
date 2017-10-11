#!/usr/bin/env node

require('dotenv').config();

const fs = require('fs');

const commands = ['version', 'migrate', 'rollback', 'migration', 'seed'];
const command = process.argv[2];

// The template for database migration files (see templates/*.js)
const version = new Date().toISOString().substr(0, 16).replace(/\D/g, '');
const template = `
module.exports.up = async (db) => {
  
};

module.exports.down = async (db) => {
  
};

module.exports.configuration = { transaction: true };
`;

function wrap(task, action) {
  const name = process.argv[2] ? `${task} ${process.argv[2]}` : task;
  const start = new Date();

  process.stdout.write(`Starting '${name}'...\n`);

  return action().then(
    () => process.stdout.write(`Finished '${name}' after ${new Date().getTime() - start.getTime()}ms\n`),
    error => process.stderr.write(`${error.stack}\n`));
}

process.nextTick(() => wrap('db', async () => {
  let db;

  if (!commands.includes(command))
    throw new Error(`Unknown command: ${command}`);

  try {
    switch (command) {
      case 'version':
        db = require('../src/db');
        await db.migrate.currentVersion().then(console.log);
        break;
      case 'migration':
        fs.writeFileSync(`${__dirname}/../migrations/${version}_${process.argv[3] || 'new'}.js`, template, 'utf8');
        break;
      case 'rollback':
        db = require('../src/db');
        await db.migrate.rollback();
        break;
      case 'seed':
        db = require('../src/db');
        await db.seed.run();
        break;
      default:
        db = require('../src/db');
        await db.migrate.latest();
    }
  } finally {
    if (db) {
      await db.destroy();
    }
  }
}));
