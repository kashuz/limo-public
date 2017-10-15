import b from 'bluebird';
import {Scene} from 'telegraf-flow';
import clock from '../../keyboards/clock';
import update from '../../../sql/update-order';

const scene = new Scene('order.finish-time');
const key = 'scene.order.finish-time.message';

scene.enter(ctx => ctx.persistent
  .sendMessage(key, 'Please choose end time', clock(ctx.flow.state.start)));

scene.action(/time\.(\d+:\d+)/, ctx =>
  update(ctx.flow.state.order.id, {start_time: ctx.flow.state.start, finish_time: ctx.match[1]})
    .then(order => b.all([
      ctx.answerCallbackQuery('Time saved'),
      ctx.persistent.deleteMessage(key),
      ctx.flow.enter('order.create', {order})])));

scene.action('cancel', ctx => b.all([
  ctx.persistent.deleteMessage(key),
  ctx.flow.enter('order.create', {order: ctx.flow.state.order})]));

scene.use((ctx, next) =>
  ctx.persistent.deleteMessage(key)
    .then(() => ctx.persistent.sendMessage(key,
      'Please choose end time', clock(ctx.flow.state.start)))
    .then(() => next()));

export default scene;
