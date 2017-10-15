
module.exports.up = async (db) => {
  await db.schema.table('car', table => {
    table.integer('position', true).defaultTo(0);
  })
};

module.exports.down = async (db) => {
  await db.schema.table('car', table => {
    table.dropColumn('position');
  })
};

module.exports.configuration = { transaction: true };
