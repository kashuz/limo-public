
module.exports.up = async (db) => {
  await db.schema.table('order', table => {
    table.string('phone_number', true);
  })
};

module.exports.down = async (db) => {
  await db.schema.table('order', table => {
    table.dropColumn('phone_number');
  })
};

module.exports.configuration = { transaction: true };
