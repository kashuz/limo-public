import b from 'bluebird';
import redis from 'redis';

b.promisifyAll(redis.RedisClient.prototype);
b.promisifyAll(redis.Multi.prototype);

const client = redis.createClient({
  url: process.env.REDIS_URL});

export default client;
