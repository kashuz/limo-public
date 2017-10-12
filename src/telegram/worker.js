import r from 'ramda';
import b from 'bluebird';
import {scheduleJob} from 'node-schedule';
import db from '../db';
import {update as progress} from './progress';
import read from '../sql/read-order';
import {timeout as clientTimeout} from './scenes/order/await';
import {timeout as groupTimeout} from './middlewares/group';
import update from '../sql/update-order';

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
        const left = seconds(order.submit_time);

        return left < process.env.HANDLE_TIMEOUT
          ? progress(telegram, order, process.env.HANDLE_TIMEOUT, left)
              .catch(() => {}) // ignore outdated updates
          : update(order.id, {status: 'timedout'}, {status: 'submitted'}).then(
              order => order && b.all([
                clientTimeout(telegram, order),
                groupTimeout(telegram, order)]),
              () => {/* ignore error if order status was updated */});
      });
  });
}
