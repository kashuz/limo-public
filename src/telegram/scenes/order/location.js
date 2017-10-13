import b from 'bluebird';
import {Scene} from 'telegraf-flow';
import geo from '../../../util/geo';
import action from '../../action';
import update from '../../../sql/update-order';

const {reply, reset} = action('scene.order.location.message');
const scene = new Scene('order.location');

const extra = {
  reply_markup: {
    inline_keyboard: [[{text: '⬅ Назад', callback_data: 'cancel'}]]}};

function pin(ctx, location) {
  return location
    ? ctx.replyWithLocation(location.latitude, location.longitude)
    : b.resolve();
}

scene.enter(ctx =>
  pin(ctx, ctx.flow.state.order.location)
    .then(() => reply(ctx, 'Отправьте геолокацию подачи машины', extra)));

scene.action('cancel', ctx => b.all([
  reset(ctx),
  ctx.flow.enter('order.create', {order: ctx.flow.state.order})]));

scene.on('location', ctx =>
  geo(ctx.message.location)
    .then(location => update(ctx.flow.state.order.id, {location}))
    .tap(() => ctx.answerCallbackQuery('Адрес выбран'))
    .then(order => b.all([
      reset(ctx),
      ctx.flow.enter('order.create', {order})]))
    .catch(() =>
      reply(ctx, 'Пока заказы принимаются только в Ташкенте', extra)));

scene.use((ctx, next) =>
  reply(ctx, 'Отправьте геолокацию подачи машины', extra)
    .then(() => next()));

export default scene;
