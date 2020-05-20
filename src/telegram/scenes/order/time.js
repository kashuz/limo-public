import b from 'bluebird';
import {Scene} from 'telegraf-flow';
import extra from '../../keyboards/clock';
import botan from "../../botan";

const scene = new Scene('order.time');
const key = 'scene.order.time.message';

scene.enter(botan('order:time:enter',
  ctx => ctx.persistent
    .sendMessage(key, 'Выберите время подачи машины', extra)));

scene.action(/time\.(\d+:\d+)/, botan('order:time:time',
  ctx => b.all([
    ctx.answerCbQuery('Время подачи выбрано'),
    ctx.persistent.deleteMessage(key),
    ctx.flow.enter('order.duration', {
      order: ctx.flow.state.order,
      start: ctx.match[1]})])));

scene.action('cancel', botan('order:time:cancel',
  ctx => b.all([
    ctx.persistent.deleteMessage(key),
    ctx.flow.enter('order.menu', {order: ctx.flow.state.order})])));

scene.use(botan('order:time:default',
  (ctx, next) =>
    ctx.persistent.deleteMessage(key)
      .then(() => ctx.persistent.sendMessage(key,
        'Выберите время подачи машины', extra))
      .then(() => next())));

export default scene;
