import b from 'bluebird';
import {Scene} from 'telegraf-flow';
import action from '../../action';
import {start, stop} from '../../progress';
import translate from '../../../translate';

const {reply, reset} = action('scene.order.await.message');
const scene = new Scene('order.await');

scene.enter(ctx =>
  reply(ctx, '⏱ Please wait while your order is being handled')
    .then(() => start(
      ctx.telegram,
      ctx.flow.state.order,
      process.env.HANDLE_TIMEOUT)));

scene.use((ctx, next) =>
  reply(ctx, '⛔️ Not implemented yet')
    .then(() => next()));

export default scene;

export function timeout(telegram, order) {
  return b.all([
    stop(telegram, order),
    translate('order_timeout').then(text =>
      telegram.sendMessage(order.user_id, text))]);
}

export function accept(telegram, order) {
  return b.all([
    stop(telegram, order),
    translate('order_accept').then(text =>
      telegram.sendMessage(order.user_id, text))]);
}

export function reject(telegram, order) {
  return b.all([
    stop(telegram, order),
    translate('order_reject').then(text =>
      telegram.sendMessage(order.user_id, text))]);
}
