import r from 'ramda';
import db from '../../db';

export default function(ctx, next) {
  const { id, first_name, last_name, username, language_code } = ctx.from;

  return db
    .raw(
      `insert into "user" (id, first_name, last_name, username, language_code)
       values(:id, :first_name, :last_name, :username, :language_code)
       on conflict (id) do update set
         first_name = :first_name,
         last_name = :last_name,
         username = :username
       returning *`,
      { id, first_name, last_name, username, language_code },
    )
    .then(({ rows }) => {
      let session = rows[0].session || {};

      Object.defineProperty(ctx, 'user', {
        get: r.always(r.omit(['session'], rows[0])),
      });

      Object.defineProperty(ctx, 'session', {
        get: () => session,
        set: value => {
          session = { ...value };
        },
      });

      return next().then(() =>
        db('user')
          .update({ session })
          .where({ id }),
      );
    });
}
