import r from 'ramda';
import b from 'bluebird';
import Composer from 'telegraf';
import update from '../../sql/update-order';
import message from '../messages/order-submit';
import read from '../../sql/read-order';
import {format as address} from '../../util/geo';
import extra from '../keyboards/odrer-handle';
import db from '../../db';
import cache from '../../cache/redis';
import assert, {failure} from '../../util/assert';
import {accept, reject} from '../scenes/order/await';
import persistent from '../persistent';

function cars(order) {
  return order.car_id
    ? b.resolve([undefined, undefined])
    : b.all([
        db('car').where({category_id: order.category_id}),
        cache.get(`order.${order.id}.car`)]);
}

function car(order) {
  return order.car_id
    ? b.resolve(undefined)
    : cache.get(`order.${order.id}.car`).then(assert('Сначала выберите машину'));
}

function format(user) {
  return user.username
    ? `@${user.username}`
    : r.trim(`${user.first_name || ''} ${user.last_name || ''}`)
}

const composer = new Composer();

composer.action(/location\.(\d+)/, ctx =>
  read(ctx.match[1])
    .then(order => b.all([
      ctx.answerCallbackQuery(),
      ctx.replyWithVenue(order.location.latitude, order.location.longitude, `Геолокация заказа №${order.id}`, address(order.location))])));

composer.action(/car\.(\d+)\.(\d+)/, ctx =>
  read(ctx.match[1])
    .tap(order => cache.set(`order.${order.id}.car`, ctx.match[2]))
    .then(order => cars(order)
      .then(([cars, car]) =>
        ctx.editMessageReplyMarkup(extra(order, cars, car).reply_markup))));

composer.action(/accept\.(\d+)/, ctx =>
  read(ctx.match[1])
    .then(order => car(order).then(
      car => update(ctx.match[1], {status: 'accepted', car_id: car}, {status: 'submitted'})
        .then(order => b.all([
          accept(ctx.telegram, order),
          ctx.reply(`ℹ️ ${format(ctx.from)} #accepted order №${order.id}`),
          ctx.editMessageText(message(order), {parse_mode: 'html'})])),
      failure(error =>
        ctx.answerCallbackQuery(error)))));

composer.action(/reject\.(\d+)/, ctx =>
  update(ctx.match[1],
      {status: 'rejected'},
      {status: 'submitted'})
    .then(order => b.all([
      reject(ctx.telegram, order),
      ctx.reply(`ℹ️ ${format(ctx.from)} #rejected order №${order.id}`),
      ctx.editMessageText(message(order), {parse_mode: 'html'})]))
    .catch(error => ctx.answerCallbackQuery(error + '')));


const group = composer.middleware();

export default function middleware(ctx, next) {
  if (ctx.chat && ctx.chat.id < 0)
    return ctx.chat.id == process.env.GROUP_ID
      ? group(ctx, () => b.resolve())
      : b.resolve();

  return next();
}

export function submit(telegram, order) {
  return cars(order)
    .then(([cars, car]) => persistent(telegram).sendMessage(
      `order.${order.id}.message`, process.env.GROUP_ID,
      message(order), extra(order, cars, car)))
}

export function timeout(telegram, order) {
  return b.all([
    telegram.sendMessage(process.env.GROUP_ID, `⚠️ Order №${order.id} #timedout`),
    persistent(telegram).editMessageText(
      `order.${order.id}.message`, process.env.GROUP_ID,
      message(order), {parse_mode: 'html'})]);
}

export function complete(telegram, order) {
  return b.all([
    telegram.sendMessage(process.env.GROUP_ID, `ℹ️ Order №${order.id} #payment_completed`),
    persistent(telegram).editMessageText(
      `order.${order.id}.message`, process.env.GROUP_ID,
      message(order), {parse_mode: 'html'})]);
}

export function cancel(telegram, order) {
  return b.all([
    telegram.sendMessage(process.env.GROUP_ID, `⚠️ Order №${order.id} #payment_cancelled`),
    persistent(telegram).editMessageText(
      `order.${order.id}.message`, process.env.GROUP_ID,
      message(order), {parse_mode: 'html'})]);
}
