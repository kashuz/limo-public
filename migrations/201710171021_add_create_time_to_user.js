
module.exports.up = async (db) => {
  await db.schema.table('user', table => {
    table.timestamp('create_time', true);
  })
};

module.exports.down = async (db) => {
  await db.schema.table('user', table => {
    table.dropColumn('create_time');
  })
};


module.exports.configuration = { transaction: true };
