import redis from '../redis';

export default {
  get: key => redis.getAsync(key),
  set: (key, value) => redis.setAsync(key, value),
  del: key => redis.delAsync(key),
};
