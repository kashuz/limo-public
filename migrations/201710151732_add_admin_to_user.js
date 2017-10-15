
module.exports.up = async (db) => {
  await db.schema.table('user', table => {
    table.boolean('admin', true).defaultTo(false);
  })
};

module.exports.down = async (db) => {
  await db.schema.table('user', table => {
    table.dropColumn('admin');
  })
};

module.exports.configuration = { transaction: true };
