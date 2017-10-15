import b from 'bluebird';
import {Scene} from 'telegraf-flow';
import clock from '../../keyboards/clock';

const scene = new Scene('order.start-time');
const key = 'scene.order.start-time.message';

scene.enter(ctx => ctx.persistent
  .sendMessage(key, 'Выберите время подачи машины', clock()));

scene.action(/time\.(\d+:\d+)/, ctx => ctx
  .answerCallbackQuery('Время подачи выбрано')
  .then(() => b.all([
    ctx.persistent.deleteMessage(key),
    ctx.flow.enter('order.duration', {
      order: ctx.flow.state.order,
      start: ctx.match[1]})])));

scene.action('cancel', ctx => b.all([
  ctx.persistent.deleteMessage(key),
  ctx.flow.enter('order.create', {order: ctx.flow.state.order})]));

scene.use((ctx, next) =>
  ctx.persistent.deleteMessage(key)
    .then(() => ctx.persistent.sendMessage(key,
      'Выберите время подачи машины', clock()))
    .then(() => next()));

export default scene;
