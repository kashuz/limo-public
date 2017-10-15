import r from 'ramda';
import b from 'bluebird';
import persistent from '../persistent';

export default function(ctx, next) {
  ctx.persistent = r.mapObjIndexed(
    f => (key, ...args) => f(key, ctx.chat.id, ...args),
    persistent(ctx.telegram, {
      get: key => b.resolve(ctx.session[key]),
      set: (key, value) => b.resolve(ctx.session[key] = value),
      del: key => {
        delete ctx.session[key];
        return b.resolve()}}));

  return next();
}
