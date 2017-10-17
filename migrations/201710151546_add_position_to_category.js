
module.exports.up = async (db) => {
  await db.schema.table('category', table => {
    table.integer('position').defaultTo(0);
  })
};

module.exports.down = async (db) => {
  await db.schema.table('category', table => {
    table.dropColumn('position');
  })
};

module.exports.configuration = { transaction: true };
