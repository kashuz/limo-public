import r from 'ramda';
import b from 'bluebird';
import {scheduleJob} from 'node-schedule';
import db from '../db';
import progress from './messages/progress';
import {timeout as clientTimeout} from './scenes/order/await';
import {timeout as groupTimeout} from './middlewares/group';
import update from '../sql/update-order';
import persistent from './persistent';
import ignore from '../util/ignore';

function seconds(time) {
  return Math.floor((new Date().getTime() - time.getTime()) / 1000);
}

export default function(telegram) {
  scheduleJob('*/2 * * * * *', function() {
    return db('order')
      .where({status: 'submitted'})
      .andWhere(db.raw('submit_time is not null'))
      .orderBy('id')
      .map(order => {
        const done = seconds(order.submit_time) / process.env.HANDLE_TIMEOUT;

        return done < 1
          ? persistent(telegram)
              .editMessageText(`order.${order.id}.progress`, order.user_id, progress(done))
              .catch(ignore([
                /message not found/i,
                /message is not modified/i])) // ignore outdated updates
          : update(order.id, {status: 'timedout'}, {status: 'submitted'}).then(
              order => order && b.all([
                clientTimeout(telegram, order),
                groupTimeout(telegram, order)]),
              () => {/* ignore error if order status was updated */});
      });
  });
}
