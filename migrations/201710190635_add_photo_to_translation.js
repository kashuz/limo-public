
module.exports.up = async (db) => {
  await db.schema.table('translation', table => {
    table.varchar('photo');
    table.boolean('requires_photo').defaultTo(false);
  })
};

module.exports.down = async (db) => {
  await db.schema.table('translation', table => {
    table.dropColumn('photo');
    table.dropColumn('requires_photo');
  })
};

module.exports.configuration = { transaction: true };
