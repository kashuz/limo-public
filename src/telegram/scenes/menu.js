import b from 'bluebird';
import {Scene} from 'telegraf-flow';
import create from '../../sql/create-order';
import compact from '../../util/compact';
import botan from "../botan";

const scene = new Scene('menu');
const key = 'scene.menu.message';

const extra = admin => ({
  reply_markup: {
    inline_keyboard: compact([
      [{text: '🚘 Сделать заказ', callback_data: 'order'}],
      [{text: '🏷 Тарифы', callback_data: 'plans'}],
      admin &&
        [{text: '⚙️ Админ', callback_data: 'admin'}]])}});

scene.enter(botan('menu:enter',
  ctx => ctx.persistent
    .sendMessage(key, 'Меню', extra(ctx.user.role == 'admin'))));

scene.action('order', botan('menu:order',
  ctx => b.all([
    ctx.persistent.deleteMessage(key),
    create({user_id: ctx.user.id})
      .then(order => ctx.flow.enter('order.menu', {order}))])));

scene.action('plans', botan('menu:plans',
  ctx => b.all([
    ctx.persistent.deleteMessage(key),
    ctx.flow.enter('plans')])));

scene.action('admin', ctx => b.all([
  ctx.persistent.deleteMessage(key),
  ctx.flow.enter('admin.menu')]));

scene.use(botan('menu:default',
  (ctx, next) => ctx.persistent.deleteMessage(key)
    .then(() => ctx.persistent
      .sendMessage(key, 'Меню', extra(ctx.user.role == 'admin')))
    .then(() => next())));

export default scene;
