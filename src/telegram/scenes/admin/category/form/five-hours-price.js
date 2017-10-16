import r from 'ramda';
import b from 'bluebird';
import {Scene} from 'telegraf-flow';
import compact from '../../../../../util/compact';

const scene = new Scene('admin.category.form.five-hours-price');
const key = 'admin.category.form.five-hours-price';

scene.enter(ctx => ctx.persistent
  .sendMessage(key, 'Отправьте цену за 5 часов', {
    reply_markup: {
      inline_keyboard: compact([
        'five_hours_price' in ctx.flow.state.category &&
          [{text: '⏩ Пропустить', callback_data: 'skip'}],
        [{text: '❌ Отмена', callback_data: 'cancel'}]])}}));

scene.hears(/^\d+$/, ctx => b.all([
  ctx.persistent.deleteMessage(key),
  ctx.flow.enter('admin.category.form.twelve-hours-price', r.assocPath(
    ['category', 'five_hours_price'], ctx.message.text,
    ctx.flow.state))]));

scene.action('skip', ctx => b.all([
  ctx.persistent.deleteMessage(key),
  ctx.flow.enter('admin.category.form.twelve-hours-price', ctx.flow.state)]));

scene.action('cancel', ctx => b.all([
  ctx.persistent.deleteMessage(key),
  ctx.flow.enter(ctx.flow.state.cancel.scene, ctx.flow.state.cancel.state)]));

export default scene;
