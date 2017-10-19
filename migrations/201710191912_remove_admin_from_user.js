
module.exports.up = async (db) => {
  await db('user')
    .where('admin', true)
    .update({role: 'admin'});

  await db.schema.table('user', table => {
    table.dropColumn('admin');
  });
};

module.exports.down = async (db) => {
  await db.schema.table('user', table => {
    table.boolean('admin').defaultTo(false);
  });
};

module.exports.configuration = { transaction: true };
