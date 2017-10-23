import b from 'bluebird';
import db from '../../db';
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
      [{text: 'ℹ О проекте', callback_data: 'about'}],
      admin &&
        [{text: '⚙️ Админ', callback_data: 'admin'}]])}});

scene.enter(botan('menu:enter',
  ctx => ctx.persistent
    .sendMessage(key, 'Основное меню', extra(ctx.user.role == 'admin'))));

scene.action('order', botan('menu:order',
  ctx => b.all([
    ctx.persistent.deleteMessage(key),
    create({user_id: ctx.user.id})
      .then(order => ctx.flow.enter('order.menu', {order}))])));

scene.action('plans', botan('menu:plans',
  ctx => b.all([
    ctx.persistent.deleteMessage(key),
    ctx.flow.enter('plans')])));

scene.action('about', botan('menu:about',
  ctx => b.all([
    ctx.persistent.deleteMessage(key),
    ctx.flow.enter('about')])));

scene.action('admin', ctx => b.all([
  ctx.persistent.deleteMessage(key),
  ctx.flow.enter('admin.menu')]));

scene.use(botan('menu:default',
  (ctx, next) => ctx.persistent.deleteMessage(key)
    .then(() => ctx.persistent
      .sendMessage(key, 'Основное меню', extra(ctx.user.role == 'admin')))
    .then(() => next())));

scene.hears(/^\/start (.+)/, botan('menu:start',
  (ctx, next) => db('user')
    .update({source: ctx.match[1]})
    .where('id', ctx.user.id)
    .whereNull('source')
    .then(() => next())));

export default scene;
