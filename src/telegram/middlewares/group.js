import r from 'ramda';
import b from 'bluebird';
import Composer from 'telegraf';
import update from '../../sql/update-order';
import message from '../messages/order-submit';
import read from '../../sql/read-order';
import {format as address} from '../../util/geo';
import extra from '../keyboards/odrer-handle';
import db from '../../db';
import redis from '../../redis';
import assert from '../../util/assert';
import {accept, reject} from '../scenes/order/await';

function cars(order) {
  return order.car_id
    ? b.resolve([undefined, undefined])
    : b.all([
        db('car').where({category_id: order.category_id}),
        redis.getAsync(`order.${order.id}.car`)]);
}

const composer = new Composer();

composer.action(/location\.(\d+)/, ctx =>
  read(ctx.match[1])
    .then(order => b.all([
      ctx.answerCallbackQuery().catch(() => {}),
      ctx.replyWithVenue(order.location.latitude, order.location.longitude, `Геолокация заказа №${order.id}`, address(order.location))])));

composer.action(/car\.(\d+)\.(\d+)/, ctx =>
  read(ctx.match[1])
    .tap(order => redis.setAsync(`order.${order.id}.car`, ctx.match[2]))
    .then(order => cars(order)
      .then(([cars, car]) =>
        ctx.editMessageReplyMarkup(extra(order, cars, car).reply_markup))));

function car(order) {
  return order.car_id
    ? b.resolve(undefined)
    : redis.getAsync(`order.${order.id}.car`)
      .then(assert('Сначала выберите машину'));
}

function format(user) {
  return user.username
    ? `@${user.username}`
    : r.trim(`${user.first_name || ''} ${user.last_name || ''}`)
}

composer.action(/accept\.(\d+)/, ctx =>
  read(ctx.match[1])
    .then(order =>
      car(order)
        .then(car => update(ctx.match[1],
          {status: 'accepted', car_id: car},
          {status: 'submitted'}))
        .then(order => b.all([
          accept(ctx.telegram, order),
          ctx.reply(`ℹ️ ${format(ctx.from)} #accepted order №${order.id}`),
          ctx.editMessageText(message(order), {parse_mode: 'html', inline_keyboard: []})])))
    .catch(error => ctx.answerCallbackQuery(error + '')));

composer.action(/reject\.(\d+)/, ctx =>
  update(ctx.match[1],
      {status: 'rejected'},
      {status: 'submitted'})
    .then(order => b.all([
      reject(ctx.telegram, order),
      ctx.reply(`ℹ️ ${format(ctx.from)} #rejected order №${order.id}`),
      ctx.editMessageText(message(order), {parse_mode: 'html', inline_keyboard: []})]))
    .catch(error => ctx.answerCallbackQuery(error + ''))
    .catch(() => {}));


const group = composer.middleware();

export default function middleware(ctx, next) {
  if (ctx.chat.id < 0)
    return ctx.chat.id == process.env.GROUP_ID
      ? group(ctx, () => b.resolve())
      : b.resolve();

  return next();
}

export function submit(telegram, order) {
  return cars(order)
    .then(([cars, car]) => telegram.sendMessage(
      process.env.GROUP_ID,
      message(order),
      extra(order, cars, car)))
    .then(r.prop('message_id'))
    .then(message => redis.setAsync(`order.${order.id}.group`, message))}

export function timeout(telegram, order) {
  return b.all([
    telegram.sendMessage(process.env.GROUP_ID, `⚠️ Order №${order.id} #timedout`),
    redis.getAsync(`order.${order.id}.group`)
      .then(id => telegram.editMessageText(
        process.env.GROUP_ID, id, undefined, message(order), {parse_mode: 'html'}))]);
}
