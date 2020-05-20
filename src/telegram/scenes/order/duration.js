import b from 'bluebird';
import {Scene} from 'telegraf-flow';
import extra from '../../keyboards/duration';
import update from '../../../sql/update-order';
import botan from "../../botan";

const scene = new Scene('order.duration');
const key = 'order.duration.message';

scene.enter(botan('order:duration:enter',
  ctx => ctx.persistent.sendMessage(key,'Выберите длительность поездки',
    extra(ctx.flow.state.order.category, ctx.flow.state.start))));

scene.action(/duration\.(\d+)/, botan('order:duration:duration',
  ctx => update(ctx.flow.state.order.id, {time: ctx.flow.state.start, duration: ctx.match[1]})
    .then(order => b.all([
      ctx.answerCbQuery('Длительность поездки выбрана'),
      ctx.persistent.deleteMessage(key),
      ctx.flow.enter('order.menu', {order})]))));

scene.action('cancel', botan('order:duration:cancel',
  ctx => b.all([
    ctx.persistent.deleteMessage(key),
    ctx.flow.enter('order.menu', {order: ctx.flow.state.order})])));

scene.use(botan('order:duration:default',
  (ctx, next) =>
    ctx.persistent.deleteMessage(key)
      .then(() => ctx.persistent.sendMessage(key, 'Выберите длительность поездки',
        extra(ctx.flow.state.order.category, ctx.flow.state.start)))
      .then(() => next())));

export default scene;
