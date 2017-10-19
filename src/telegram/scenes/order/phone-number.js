import b from 'bluebird';
import {Scene} from 'telegraf-flow';
import update from '../../../sql/update-order';
import read from '../../../sql/read-order';
import compact from '../../../util/compact';
import db from '../../../db';
import botan from "../../botan";

const scene = new Scene('order.phone-number');
const key = 'scene.order.phone.message';

function intro(ctx) {
  return ctx.user.phone_number
    ? ctx.persistent.sendMessage(key,
        'Вы можете указать другой контактный номер для этого заказа. ' +
        'Пожалуйста введите номер или отправьте контакт.',
        {reply_markup: {
           inline_keyboard: compact([
             ctx.flow.state.order.phone_number &&
              [{text: '❌ Удалить контактный номер', callback_data: 'clear'}],
             [{text: '⬅ Назад', callback_data: 'cancel'}]])}})
    : ctx.persistent.sendMessage(key,
        'Пожалуйста отправьте свой номер телефона',
        {reply_markup: {
           resize_keyboard: true,
           keyboard: [[
             {text: '⬅ Назад', callback_data: 'cancel'},
             {text: '☎️ Отправить номер', request_contact: true}]]}})
}

scene.enter(botan('order:phone-number:enter',
  ctx => intro(ctx)));

scene.hears(/назад/i, botan('order:phone-number:cancel',
  ctx => b.all([
    ctx.persistent.deleteMessage(key),
    ctx.flow.enter('order.menu', {order: ctx.flow.state.order})])));

scene.action('cancel', botan('order:phone-number:cancel',
  ctx => b.all([
    ctx.persistent.deleteMessage(key),
    ctx.flow.enter('order.menu', {order: ctx.flow.state.order})])));

scene.on('text', botan('order:phone-number:text',
  (ctx, next) =>
    ctx.user.phone_number
      ? update(ctx.flow.state.order.id, {phone_number: ctx.message.text})
        .then(order => b.all([
          ctx.persistent.deleteMessage(key),
          ctx.flow.enter('order.menu', {order})]))
      : next()));

scene.on('contact', botan('order:phone-number:contact',
  ctx => ctx.user.phone_number
    ? update(ctx.flow.state.order.id, {phone_number: ctx.message.contact.phone_number})
        .then(order => b.all([
          ctx.persistent.deleteMessage(key),
          ctx.flow.enter('order.menu', {order})]))
    : db('user')
        .update({phone_number: ctx.message.contact.phone_number.replace(/\+/g, '')})
        .where({id: ctx.user.id})
        .then(() => read(ctx.flow.state.order.id))
        .then(order => b.all([
          ctx.persistent.deleteMessage(key),
          ctx.flow.enter('order.menu', {order})]))));

scene.action('clear', botan('order:phone-number:clear',
  ctx =>
    update(ctx.flow.state.order.id, {phone_number: null})
      .then(order => b.all([
        ctx.answerCallbackQuery('Контактный номер удален'),
        ctx.persistent.deleteMessage(key),
        ctx.flow.enter('order.menu', {order})]))));

scene.use(botan('order:phone-number:default',
  (ctx, next) =>
    ctx.persistent.deleteMessage(key)
      .then(() => intro(ctx))
      .then(() => next())));

export default scene;
