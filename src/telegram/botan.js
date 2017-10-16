const botanio = process.env.BOTAN_TOKEN &&
  require('botanio')(process.env.BOTAN_TOKEN);

export default function botan(action, f) {
  return (ctx, next) => {
    botanio && botanio
      .track({...ctx.message, from: ctx.from}, action);

    return f(ctx, next);
  }
}
