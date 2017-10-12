import b from 'bluebird';
import Composer from 'telegraf';
import update from '../../sql/update-order';
import message from '../message/order-submit';
import read from '../../sql/read-order';
import {format as address} from '../../util/geo';
import extra from '../keyboards/odrer-handle';
import db from '../../db';
import redis from '../../redis';
import assert from '../../util/assert';

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
      ctx.replyWithVenue(order.location.latitude, order.location.longitude, `Location of order №${order.id}`, address(order.location))])));

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
      .then(assert('Please select car first'));
}

composer.action(/accept\.(\d+)/, ctx =>
  read(ctx.match[1])
    .then(order =>
      car(order)
        .then(car => update(ctx.match[1], {status: 'accepted', car_id: car}))
        .then(order => b.all([
          ctx.editMessageText(message(order), {parse_mode: 'html', inline_keyboard: []})])))
    .catch(error => ctx.answerCallbackQuery(error + '')));

composer.action(/reject\.(\d+)/, ctx =>
  update(ctx.match[1], {status: 'rejected'})
    .then(order => b.all([
      ctx.editMessageText(message(order), {parse_mode: 'html', inline_keyboard: []})])));

composer.action('noop', ctx =>
  ctx.answerCallbackQuery('Please choose valid car'));

const group = composer.middleware();

export default function middleware(ctx, next) {
  return ctx.chat.id == process.env.GROUP_ID
    ? group(ctx, next)
    : next();
};

export function submit(ctx, order) {
  return cars(order).then(([cars, car]) =>
    ctx.telegram.sendMessage(process.env.GROUP_ID, message(order), extra(order, cars, car)))}
