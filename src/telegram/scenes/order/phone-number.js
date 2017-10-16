import b from 'bluebird';
import {Scene} from 'telegraf-flow';
import update from '../../../sql/update-order';
import compact from '../../../util/compact';
import botan from "../../botan";

const scene = new Scene('order.phone-number');
const key = 'scene.order.phone.message';

function extra(order) {
  return {
    reply_markup: {
      inline_keyboard: compact([
        order.phone_number &&
          [{text: '❌ Удалить контактный номер', callback_data: 'clear'}],
        [{text: '⬅ Back', callback_data: 'cancel'}]])}};
}

scene.enter(botan('order:phone-number:enter',
  ctx => ctx.persistent.sendMessage(key,
    'Вы можете указать другой контактный номер для этого заказа. ' +
    'Пожалуйста введите номер или отправьте контакт.',
    extra(ctx.flow.state.order))));

scene.action('cancel', botan('order:phone-number:cancel',
  ctx => b.all([
    ctx.persistent.deleteMessage(key),
    ctx.flow.enter('order.menu', {order: ctx.flow.state.order})])));

scene.on('text', botan('order:phone-number:text',
  ctx =>
    update(ctx.flow.state.order.id, {phone_number: ctx.message.text})
      .then(order => b.all([
        ctx.persistent.deleteMessage(key),
        ctx.flow.enter('order.menu', {order})]))));

scene.on('contact', botan('order:phone-number:contact',
  ctx =>
    update(ctx.flow.state.order.id, {phone_number: ctx.message.contact.phone_number})
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
      .then(() => ctx.persistent.sendMessage(key,
        'Пожалуйста введите номер или отправьте контакт', extra(ctx.flow.state.order)))
      .then(() => next())));

export default scene;
