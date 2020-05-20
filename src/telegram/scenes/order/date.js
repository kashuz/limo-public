import b from 'bluebird';
import {Scene} from 'telegraf-flow';
import {init} from '../../../util/calendar';
import {date} from '../../../util/date';
import calendar from '../../keyboards/calendar';
import update from '../../../sql/update-order';
import botan from "../../botan";

const scene = new Scene('order.date');
const key = 'scene.order.date.message';

scene.enter(botan('order:date:enter',
  ctx => ctx.persistent
    .sendMessage(key, 'Пожалуйста выберите дату',
      calendar(init(ctx.flow.state.order.date)))));

scene.action(/month\.(\d+)\.(\d+)/, botan('order:date:month',
  ctx => b.all([
    ctx.answerCbQuery(),
    ctx.persistent.editMessageReplyMarkup(
      key, calendar([ctx.match[1], ctx.match[2]]).reply_markup)])));

scene.action(/day\.(\d+)\.(\d+)\.(\d+)/, botan('order:date:day',
  ctx =>
    update(ctx.flow.state.order.id, {date: date(ctx.match[1], ctx.match[2], ctx.match[3])})
      .then(order => b.all([
        ctx.answerCbQuery('Дата выбрана'),
        ctx.persistent.deleteMessage(key),
        ctx.flow.enter('order.menu', {order})]))));

scene.action('noop', botan('order:date:noop',
  ctx => ctx.answerCbQuery('Пожалуйста выберите дату')));

scene.action('cancel', botan('order:date:cancel',
  ctx => b.all([
    ctx.persistent.deleteMessage(key),
    ctx.flow.enter('order.menu', {order: ctx.flow.state.order})])));

scene.use(botan('order:date:default',
  (ctx, next) =>
    ctx.persistent.deleteMessage(key)
      .then(() => ctx.persistent.sendMessage(
        key, 'Пожалуйста выберите дату', calendar(init())))
      .then(() => next())));

export default scene;
