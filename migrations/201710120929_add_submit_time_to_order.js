
module.exports.up = async (db) => {
  await db.schema.table('order', table => {
    table.timestamp('submit_time', true);
  })
};

module.exports.down = async (db) => {
  await db.schema.table('order', table => {
    table.dropColumn('submit_time');
  })
};

module.exports.configuration = { transaction: true };
