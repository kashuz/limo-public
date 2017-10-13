import RateLimit from 'telegraf-ratelimit';

export default new RateLimit({
  window: 1000,
  limit: 1})
