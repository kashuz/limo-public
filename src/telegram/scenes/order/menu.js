import b from 'bluebird';
import {Scene} from 'telegraf-flow';
import update from '../../../sql/update-order';
import message, {errors} from '../../messages/order-create';
import extra from '../../keyboards/order-create';
import {submit} from '../../middlewares/group';
import botan from "../../botan";

const scene = new Scene('order.menu');
const key = 'scene.order.menu.message';

scene.enter(ctx => ctx.persistent
  .sendMessage(key, message(ctx.flow.state.order), extra(ctx.flow.state.order)));

scene.action('car', botan('order:menu:car',
  ctx => b.all([
    ctx.persistent.deleteMessage(key),
    ctx.flow.enter('order.car', {order: ctx.flow.state.order})])));

scene.action('date', botan('order:menu:date',
  ctx => b.all([
    ctx.persistent.deleteMessage(key),
    ctx.flow.enter('order.date', {order: ctx.flow.state.order})])));

scene.action('note', botan('order:menu:note',
  ctx => b.all([
    ctx.persistent.deleteMessage(key),
    ctx.flow.enter('order.note', {order: ctx.flow.state.order})])));

scene.action('location', botan('order:menu:location',
  ctx => b.all([
    ctx.persistent.deleteMessage(key),
    ctx.flow.enter('order.location', {order: ctx.flow.state.order})])));

scene.action('time', botan('order:menu:time',
  ctx => b.all([
    ctx.persistent.deleteMessage(key),
    ctx.flow.enter('order.time', {order: ctx.flow.state.order})])));

scene.action('phone-number', botan('order:menu:phone-number',
  ctx => b.all([
    ctx.persistent.deleteMessage(key),
    ctx.flow.enter('order.phone-number', {order: ctx.flow.state.order})])));

scene.action(/payment\.(payme|cash)/, botan('order:menu:payment',
  ctx => update(ctx.flow.state.order.id, {payment: ctx.match[1]})
    .then(order => ctx.flow.state.order = order)
    .then(order => b.all([
      ctx.answerCallbackQuery('Способ оплаты выбран'),
      ctx.persistent.editMessageText(key, message(order), extra(order))]))));

scene.action('cancel', botan('order:menu:cancel',
  ctx => update(ctx.flow.state.order.id, {status: 'cancelled'})
    .then(order => b.all([
      ctx.answerCallbackQuery('Заказ отменен'),
      ctx.persistent.editMessageText(key, message(order), {parse_mode: 'html'}),
      ctx.flow.enter('menu')]))));

scene.action('submit', botan('order:menu:submit',
  ctx => errors(ctx.flow.state.order)
    ? ctx.answerCallbackQuery(errors(ctx.flow.state.order), undefined, true)
    : update(ctx.flow.state.order.id, {status: 'submitted', submit_time: new Date()})
        .tap(order => b.all([
          ctx.answerCallbackQuery('Заказ отправлен'),
          ctx.persistent.editMessageText(key, message(order), {parse_mode: 'html'}),
          submit(ctx.telegram, order)]))
        .then(order => ctx.flow.enter('order.await', {order}))));

scene.use(botan('order:menu:default',
  (ctx, next) =>
    ctx.persistent.deleteMessage(key)
      .then(() => ctx.persistent.sendMessage(key,
        message(ctx.flow.state.order), extra(ctx.flow.state.order)))
      .then(() => next())));

export default scene;
