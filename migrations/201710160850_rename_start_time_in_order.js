
module.exports.up = async (db) => {
  await db.schema.table('order', table => {
    table.renameColumn('start_time', 'time');
  })
};

module.exports.down = async (db) => {
  await db.schema.table('order', table => {
    table.renameColumn('time', 'start_time');
  })
};

module.exports.configuration = { transaction: true };
