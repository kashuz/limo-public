import b from 'bluebird';
import {Scene} from 'telegraf-flow';
import action from '../../action';
import {init} from '../../../util/calendar';
import {date} from '../../../util/date';
import calendar from '../../keyboards/calendar';
import update from '../../../sql/update-order';

const {reply, reset} = action('scene.order.date.message');
const scene = new Scene('order.date');

scene.enter(ctx =>
  reply(ctx, 'Пожалуйста выберите дату', calendar(init(ctx.flow.state.order.date))));

scene.action(/month\.(\d+)\.(\d+)/, ctx => ctx
  .editMessageReplyMarkup(calendar([ctx.match[1], ctx.match[2]]).reply_markup)
  .then(() => ctx.answerCallbackQuery()));

scene.action(/day\.(\d+)\.(\d+)\.(\d+)/, ctx =>
  update(ctx.flow.state.order.id, {date: date(ctx.match[1], ctx.match[2], ctx.match[3])})
    .tap(() => ctx.answerCallbackQuery('Дата выбрана'))
    .then(order => b.all([
      reset(ctx),
      ctx.flow.enter('order.create', {order})])));

scene.action('noop', ctx =>
  ctx.answerCallbackQuery('Пожалуйста выберите дату'));

scene.action('cancel', ctx => b.all([
  reset(ctx),
  ctx.flow.enter('order.create', {order: ctx.flow.state.order})]));

scene.use((ctx, next) =>
  reply(ctx, 'Пожалуйста выберите дату', calendar(init()))
    .then(() => next()));

export default scene;
