import r from 'ramda';
import b from 'bluebird';
import {Scene} from 'telegraf-flow';
import compact from '../../../../../util/compact';

const scene = new Scene('admin.car.form.name');
const key = 'admin.car.form.name';

scene.enter(ctx => ctx.persistent
  .sendMessage(key, 'Отправьте название', {
    reply_markup: {
      inline_keyboard: compact([
        'name' in ctx.flow.state.car &&
          [{text: '⏩ Пропустить', callback_data: 'skip'}],
        [{text: '❌ Отмена', callback_data: 'cancel'}]])}}));

scene.on('text', ctx => b.all([
  ctx.persistent.deleteMessage(key),
  ctx.flow.enter('admin.car.form.photo', r.assocPath(
    ['car', 'name'], ctx.message.text,
    ctx.flow.state))]));

scene.action('skip', ctx => b.all([
  ctx.persistent.deleteMessage(key),
  ctx.flow.enter('admin.car.form.photo', ctx.flow.state)]));

scene.action('cancel', ctx => b.all([
  ctx.persistent.deleteMessage(key),
  ctx.flow.enter(ctx.flow.state.cancel.scene, ctx.flow.state.cancel.state)]));

export default scene;
