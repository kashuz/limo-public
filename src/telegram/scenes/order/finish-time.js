import r from 'ramda';
import b from 'bluebird';
import {Scene} from 'telegraf-flow';
import db from '../../../db';
import action from '../../action';
import clock from '../../keyboards/clock';
import update from '../../../sql/update-order';

const {reply, reset} = action('scene.order.finish-time.message');
const scene = new Scene('order.finish-time');

scene.enter(ctx =>
  reply(ctx, 'Please choose end time', clock(ctx.flow.state.start)));

scene.action(/time\.(\d+:\d+)/, ctx =>
  ctx.answerCallbackQuery()
    .then(() => update(ctx.flow.state.order.id, {
      start_time: ctx.flow.state.start,
      finish_time: ctx.match[1]}))
    .tap(() => ctx.reply('✅ Time saved'))
    .then(order => b.all([reset(ctx), ctx.flow.enter('order.create', {order})])));

scene.action('cancel', ctx => b.all([
  reset(ctx),
  ctx.flow.enter('order.create', {order: ctx.flow.state.order})]));

scene.use((ctx, next) =>
  reply(ctx, 'Please choose end time', clock(ctx.flow.state.start))
    .then(() => next()));

export default scene;
