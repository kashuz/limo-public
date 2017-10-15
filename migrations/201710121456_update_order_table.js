
module.exports.up = async (db) => {
  await db.schema.table('order', table => {
    table.dropColumn('finish_time');
    table.integer('duration');
    table.integer('cost');
  })
};

module.exports.down = async (db) => {
  await db.schema.table('order', table => {
    table.dropColumn('duration');
    table.dropColumn('cost');
    table.varchar('finish_time');
  })
};

module.exports.configuration = { transaction: true };
