import r from 'ramda';
import b from 'bluebird';
import {Scene} from 'telegraf-flow';
import compact from '../../../../../util/compact';

const scene = new Scene('admin.car.form.photo');
const key = 'admin.car.form.photo';

scene.enter(ctx => ctx.persistent
  .sendMessage(key, 'Отправьте фото', {
    reply_markup: {
      inline_keyboard: compact([
        'photo' in ctx.flow.state.car &&
          [{text: '⏩ Пропустить', callback_data: 'skip'}],
        [{text: '❌ Отмена', callback_data: 'cancel'}]])}}));

scene.on('photo', ctx => b.all([
  ctx.persistent.deleteMessage(key),
  ctx.flow.enter('admin.car.form.link', r.assocPath(
    ['car', 'photo'], r.last(ctx.message.photo).file_id,
    ctx.flow.state))]));

scene.action('skip', ctx => b.all([
  ctx.persistent.deleteMessage(key),
  ctx.flow.enter('admin.car.form.link', ctx.flow.state)]));

scene.action('cancel', ctx => b.all([
  ctx.persistent.deleteMessage(key),
  ctx.flow.enter(ctx.flow.state.cancel.scene, ctx.flow.state.cancel.state)]));

export default scene;
