import b from 'bluebird';
import {Scene} from 'telegraf-flow';
import db from '../../../db';
import update from '../../../sql/update-order';
import {submit} from '../../middlewares/group';
import translate from '../../../translate';
import botan from "../../botan";

const scene = new Scene('order.agreement');
const key = 'scene.order.agreement.message';

function forward(ctx) {
  return update(ctx.flow.state.order.id, {status: 'submitted', submit_time: new Date()})
    .tap(order => b.all([
      ctx.answerCbQuery('Заказ отправлен'),
      submit(ctx.telegram, order)]))
    .then(order => ctx.flow.enter('order.await', {order}))
}

const extra = {
  reply_markup: {
    remove_keyboard: true,
    inline_keyboard: [[{
      text: '✅ Принить условия и отправить заказ',
      callback_data: 'agreement.yes'}]]}};

scene.enter(botan('order:agreement:enter',
  ctx => ctx.user.agreed
    ? forward(ctx)
    : translate('agreement').then(text => ctx.persistent
        .sendMessage(key, text, extra))));

scene.action('agreement.yes', botan('order:agreement:yes',
  ctx => db('user').update({agreed: true}).where('id', ctx.user.id)
    .then(() => b.all([
      ctx.persistent.deleteMessage(key),
      forward(ctx)]))));

scene.use(botan('order:agreement:default',
  (ctx, next) =>
    ctx.persistent.deleteMessage(key)
      .then(() => translate('agreement'))
      .then(text => ctx.persistent.sendMessage(key, text, extra))
      .then(() => next())));

export default scene;
