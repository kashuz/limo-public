import r from 'ramda';
import db from '../../db';

export default function(ctx, next) {
  return !ctx.from
    ? next()
    : db.raw(
        `insert into "user" (id, first_name, last_name, username, language_code)
         values(:id, :first_name, :last_name, :username, :language_code)
         on conflict (id) do update set
           first_name = :first_name,
           last_name = :last_name,
           username = :username
         returning *`,
        {id: ctx.from.id,
         first_name: ctx.from.first_name || null,
         last_name: ctx.from.last_name || null,
         username: ctx.from.username || null,
         language_code: ctx.from.language_code || null})
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
