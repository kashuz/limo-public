export default function(ctx, next) {
  return !ctx.user.phone_number
    ? ctx.flow.enter('register')
    : next();
}
