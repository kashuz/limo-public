import b from 'bluebird';
import {Scene} from 'telegraf-flow';
import update from '../../../sql/update-order';
import compact from '../../../util/compact';
import botan from "../../botan";
import translate from '../../../translate';

const scene = new Scene('order.note');
const key = 'scene.order.note.message';

function extra(order) {
  return {
    reply_markup: {
      inline_keyboard: compact([
        order.note &&
          [{text: '❌ Удалить заметки', callback_data: 'clear'}],
        [{text: '⬅ Назад', callback_data: 'cancel'}]])}};
}

scene.enter(botan('order:note:enter',
  ctx => translate('note').then(text =>
    ctx.persistent.sendMessage(key, text, extra(ctx.flow.state.order)))));

scene.action('cancel', botan('order:note:cancel',
  ctx => b.all([
    ctx.persistent.deleteMessage(key),
    ctx.flow.enter('order.menu', {order: ctx.flow.state.order})])));

scene.on('text', botan('order:note:text',
  ctx => update(ctx.flow.state.order.id, {note: ctx.message.text})
    .then(order => b.all([
      ctx.persistent.deleteMessage(key),
      ctx.flow.enter('order.menu', {order})]))));

scene.action('clear', botan('order:note:clear',
  ctx => update(ctx.flow.state.order.id, {note: null})
    .then(order => b.all([
      ctx.answerCbQuery('Комментарий удален'),
      ctx.persistent.deleteMessage(key),
      ctx.flow.enter('order.menu', {order})]))));

scene.use(botan('order:note:default',
  (ctx, next) =>
    ctx.persistent.deleteMessage(key)
      .then(() => translate('note'))
      .then(text => ctx.persistent.sendMessage(key, text, extra(ctx.flow.state.order)))
      .then(() => next())));

export default scene;
