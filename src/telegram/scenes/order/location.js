import b from 'bluebird';
import {Scene} from 'telegraf-flow';
import geo from '../../../util/geo';
import update from '../../../sql/update-order';
import botan from "../../botan";

const scene = new Scene('order.location');
const key = 'scene.order.location.message';
const err = 'scene.order.location.message';

const extra = {
  reply_markup: {
    inline_keyboard: [[{text: '⬅ Назад', callback_data: 'cancel'}]]}};

scene.enter(botan('order:location:enter',
  ctx => ctx.persistent.sendMessage(key,
    '📎 Отправьте геолокацию подачи машины', extra)));

scene.action('cancel', botan('order:location:cancel',
  ctx => b.all([
    ctx.persistent.deleteMessage(key),
    ctx.flow.enter('order.menu', {order: ctx.flow.state.order})])));

scene.on('location', botan('order:location:location',
  ctx => geo(ctx.message.location)
    .then(
      location => update(ctx.flow.state.order.id, {location})
        .then(order => b.all([
          ctx.persistent.deleteMessage(err),
          ctx.persistent.deleteMessage(key),
          ctx.flow.enter('order.menu', {order})])),
      text => ctx.persistent.deleteMessage(err)
        .then(() => ctx.persistent.sendMessage(err, text)))));

scene.use(botan('order:location:default',
  (ctx, next) =>
    ctx.persistent.deleteMessage(key)
      .then(() => ctx.persistent.sendMessage(key, '📎 Отправьте геолокацию подачи машины', extra))
      .then(() => next())));

export default scene;
