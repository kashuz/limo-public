import r from 'ramda';
import b from 'bluebird';
import equal from 'deep-equal';
import clone from 'clone';
import db from '../../db';

export default function(ctx, next) {
  let original;

  return !ctx.from
    ? next()
    : db.raw(
        `insert into "user" (id, first_name, last_name, username, language_code, create_time)
         values(:id, :first_name, :last_name, :username, :language_code, :create_time)
         on conflict (id) do update set
           first_name = :first_name,
           last_name = :last_name,
           username = :username
         returning *`,
        {id: ctx.from.id,
         first_name: ctx.from.first_name || null,
         last_name: ctx.from.last_name || null,
         username: ctx.from.username || null,
         language_code: ctx.from.language_code || null,
         create_time: new Date()})
      .then(r.prop('rows'))
      .then(r.head)
      .then(({session, ...user}) => {
        ctx.user = user;
        ctx.session = clone(original = session || {})})
      .then(() => next())
      .tap(() => b.resolve(
          equal(original, ctx.session) ||
          db('user')
              .update({ session: ctx.session })
              .where({ id: ctx.user.id })));
}
