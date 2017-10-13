import r from 'ramda';
import b from 'bluebird';
import {Scene} from 'telegraf-flow';
import message from '../../messages/order-create';
import {start, stop} from '../../progress';
import translate from '../../../translate';
import db from '../../../db';

const scene = new Scene('order.await');

scene.enter(ctx => start(
  ctx.telegram,
  ctx.flow.state.order,
  process.env.HANDLE_TIMEOUT));

scene.action('menu', ctx => b.all([
  ctx.editMessageReplyMarkup({inline_keyboard: []}),
  ctx.flow.enter('menu')]));

export default scene;

export function timeout(telegram, order) {
  return b.all([
    stop(telegram, order),
    reset(telegram, order),
    translate('order_timeout').then(text =>
      telegram.sendMessage(order.user_id, text, {
        parse_mode: 'markdown',
        reply_markup: {
          inline_keyboard: [[{text: '➡ Menu', callback_data: 'menu'}]]}}))]);
}

export function accept(telegram, order) {
  return b.all([
    stop(telegram, order),
    reset(telegram, order),
    translate('order_accept').then(text =>
      telegram.sendMessage(order.user_id, text, {
        parse_mode: 'markdown',
        reply_markup: {
          inline_keyboard: [[{text: '➡ Menu', callback_data: 'menu'}]]}}))]);
}

export function reject(telegram, order) {
  return b.all([
    stop(telegram, order),
    reset(telegram, order),
    translate('order_reject').then(text =>
      telegram.sendMessage(order.user_id, text, {
        parse_mode: 'markdown',
        reply_markup: {
          inline_keyboard: [[{text: '➡ Menu', callback_data: 'menu'}]]}}))]);
}

function reset(telegram, order) {
  db('user')
    .where('id', order.user_id)
    .pluck('session')
    .then(r.head)
    .then(r.prop('scene.order.create.message'))
    .then(id => telegram.editMessageText(
      order.user_id, id, undefined, message(order), {parse_mode: 'html'}))
}
