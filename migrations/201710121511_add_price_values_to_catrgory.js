
module.exports.up = async (db) => {
  await db.schema.table('category', table => {
    table.integer('min_price');
    table.integer('day_hour_price');
    table.integer('night_hour_price');
    table.integer('five_hours_price');
    table.integer('twelve_hours_price');
  })
};

module.exports.down = async (db) => {
  await db.schema.table('category', table => {
    table.dropColumn('min_price');
    table.dropColumn('day_hour_price');
    table.dropColumn('night_hour_price');
    table.dropColumn('five_hours_price');
    table.dropColumn('twelve_hours_price');
  })
};

module.exports.configuration = { transaction: true };
