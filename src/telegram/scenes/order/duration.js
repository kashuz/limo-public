import b from 'bluebird';
import {Scene} from 'telegraf-flow';
import extra from '../../keyboards/duration';
import update from '../../../sql/update-order';

const scene = new Scene('order.duration');
const key = 'order.duration.message';

scene.enter(ctx =>
  ctx.persistent.sendMessage(key,'Выберите длительность поездки',
    extra(ctx.flow.state.order.category, ctx.flow.state.start)));

scene.action(/duration\.(\d+)/, ctx =>
  update(ctx.flow.state.order.id, {time: ctx.flow.state.start, duration: ctx.match[1]})
    .then(order => b.all([
      ctx.answerCallbackQuery('Длительность поездки выбрана'),
      ctx.persistent.deleteMessage(key),
      ctx.flow.enter('order.create', {order})])));

scene.action('cancel', ctx => b.all([
  ctx.persistent.deleteMessage(key),
  ctx.flow.enter('order.create', {order: ctx.flow.state.order})]));

scene.use((ctx, next) =>
  ctx.persistent.deleteMessage(key)
    .then(() => ctx.persistent.sendMessage(key, 'Выберите длительность поездки',
      extra(ctx.flow.state.order.category, ctx.flow.state.start)))
    .then(() => next()));

export default scene;
