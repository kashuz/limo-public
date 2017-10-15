import b from 'bluebird';
import {Scene} from 'telegraf-flow';
import db from '../../../db';
import duration from '../../keyboards/duration';
import update from '../../../sql/update-order';

const scene = new Scene('order.duration');

const category = ctx => db('category')
  .where('id', ctx.flow.state.order.category_id)
  .first();

const show = ctx => category(ctx)
  .then(category => ctx.reply('Выберите длительность поездки',
      duration(category, ctx.flow.state.start)));

scene.enter(show);

scene.action(/duration\.(\d+):(\d+)/, ctx => {
  update(ctx.flow.state.order.id,
    {start_time: ctx.flow.state.start, duration: ctx.match[1], cost: ctx.match[2]})
    .then(order => b.all([
      ctx.answerCallbackQuery('Длительность поездки выбрана'),
      ctx.deleteMessage(),
      ctx.flow.enter('order.create', {order})]))});

scene.action('cancel', ctx => b.all([
  ctx.deleteMessage(),
  ctx.flow.enter('order.create', {order: ctx.flow.state.order})]));

scene.use(show);

export default scene;
