import r from 'ramda';
import db from '../../db';

export default function(ctx, next) {
  return db
    .raw(
      `insert into "user" (id, first_name, last_name, username, language_code)
       values(:id, :first_name, :last_name, :username, :language_code)
       on conflict (id) do update set
         first_name = :first_name,
         last_name = :last_name,
         username = :username
       returning *`,
      r.pick(['id', 'first_name', 'last_name', 'username', 'language_code'], ctx.from))
    .then(r.prop('rows'))
    .then(r.head)
    .then(({session, ...user}) => {
      ctx.user = user;
      ctx.session = session || {}})
    .then(() => next())
    .then(() => db('user')
      .update({ session: ctx.session })
      .where({ id: ctx.user.id }));
}
