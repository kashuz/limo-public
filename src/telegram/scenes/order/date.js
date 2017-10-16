import b from 'bluebird';
import {Scene} from 'telegraf-flow';
import {init} from '../../../util/calendar';
import {date} from '../../../util/date';
import calendar from '../../keyboards/calendar';
import update from '../../../sql/update-order';

const scene = new Scene('order.date');
const key = 'scene.order.date.message';

scene.enter(ctx => ctx.persistent
  .sendMessage(key, 'Пожалуйста выберите дату',
    calendar(init(ctx.flow.state.order.date))));

scene.action(/month\.(\d+)\.(\d+)/, ctx => b.all([
  ctx.answerCallbackQuery(),
  ctx.persistent.editMessageReplyMarkup(
    key, calendar([ctx.match[1], ctx.match[2]]).reply_markup)]));

scene.action(/day\.(\d+)\.(\d+)\.(\d+)/, ctx =>
  update(ctx.flow.state.order.id, {date: date(ctx.match[1], ctx.match[2], ctx.match[3])})
    .then(order => b.all([
      ctx.answerCallbackQuery('Дата выбрана'),
      ctx.persistent.deleteMessage(key),
      ctx.flow.enter('order.create', {order})])));

scene.action('noop', ctx =>
  ctx.answerCallbackQuery('Пожалуйста выберите дату'));

scene.action('cancel', ctx => b.all([
  ctx.persistent.deleteMessage(key),
  ctx.flow.enter('order.create', {order: ctx.flow.state.order})]));

scene.use((ctx, next) =>
  ctx.persistent.deleteMessage(key)
    .then(() => ctx.persistent.sendMessage(
      key, 'Пожалуйста выберите дату', calendar(init())))
    .then(() => next()));

export default scene;
