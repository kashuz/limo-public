
module.exports.up = async (db) => {
  await db.schema.table('user', table => {
    table.varchar('source');
  })
};

module.exports.down = async (db) => {
  await db.schema.table('user', table => {
    table.dropColumn('source');
  })
};
module.exports.configuration = { transaction: true };
