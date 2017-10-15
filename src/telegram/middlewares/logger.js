const log = require('debug').default('app.telegram');

export default function(ctx, next) {
  log(ctx.update);
  return next();
};
