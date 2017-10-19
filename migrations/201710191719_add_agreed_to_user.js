
module.exports.up = async (db) => {
  await db.schema.table('user', table => {
    table.boolean('agreed').defaultTo(false);
  });

  await db('user')
    .whereNotIn(db.raw(`coalesce(session #>> '{"_flow", "id"}', 'register')`), ['agreement', 'register'])
    .update({agreed: true});
};

module.exports.down = async (db) => {
  await db.schema.table('user', table => {
    table.dropColumn('agreed');
  })
};

module.exports.configuration = { transaction: true };
