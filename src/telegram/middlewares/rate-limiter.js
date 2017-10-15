import RateLimit from 'telegraf-ratelimit';

const ignoredUpdates = [
  'pre_checkout_query',
  'successful_payment'];

export default new RateLimit({
  window: 1000,
  limit: 1,

  keyGenerator: ctx =>
    ignoredUpdates.includes(ctx.updateType) ||
    ignoredUpdates.some((type) => ctx.updateSubTypes.includes(type))
      ? null
      : ctx.from.id,

  onLimitExceeded: ctx =>
    console.warn('Update ignored from %username %firstName %lastName (%id): <%updateType>'
      .replace(/%username/g, ctx.from.username ? `@${ctx.from.username}` : null)
      .replace(/%firstName/g, ctx.from.first_name  || '')
      .replace(/%lastName/g, ctx.from.last_name || '')
      .replace(/%id/g, ctx.from.id)
      .replace(/%updateType/g, ctx.updateSubType || ctx.updateSubTypes[0] || ctx.updateType)
      .replace(/ +|\n/g, ' '))})
