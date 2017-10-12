import r from 'ramda';
import redis from '../redis';
import progress from './messages/progress';
import assert from '../util/assert';

export function stop(telegram, order) {
  return redis.getAsync(`order.${order.id}.progress`)
    .then(message => message && telegram
      .deleteMessage(order.user_id, message)
      .then(() => redis.delAsync(`order.${order.id}.progress`))
      .catch(() => {})) // ignore message not found error
}

export function start(telegram, order, total) {
  return stop(telegram, order)
    .then(() => telegram.sendMessage(order.user_id, progress(total, 0)))
    .then(r.prop('message_id'))
    .then(message => redis.setAsync(`order.${order.id}.progress`, message));
}

export function update(telegram, order, total, done) {
  return redis.getAsync(`order.${order.id}.progress`)
    .then(assert('Progress message not found'))
    .then(message => telegram
      .editMessageText(order.user_id, message, undefined, progress(total, done))
      .catch(() => {})) // ignore message text not modified error
}

