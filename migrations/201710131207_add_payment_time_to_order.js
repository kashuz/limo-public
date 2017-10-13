
module.exports.up = async (db) => {
  await db.schema.table('order', table => {
    table.timestamp('payment_time', true);
  })
};

module.exports.down = async (db) => {
  await db.schema.table('order', table => {
    table.dropColumn('payment_time');
  })
};

module.exports.configuration = { transaction: true };
