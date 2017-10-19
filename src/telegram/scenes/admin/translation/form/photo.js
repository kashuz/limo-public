import r from 'ramda';
import b from 'bluebird';
import {Scene} from 'telegraf-flow';
import compact from '../../../../../util/compact';

const scene = new Scene('admin.translation.form.photo');
const key = 'admin.translation.form.photo';

scene.enter(ctx => ctx.persistent
  .sendMessage(key, 'Отправьте фото', {
    reply_markup: {
      inline_keyboard: compact([
        [{text: '⏩ Пропустить', callback_data: 'skip'}],
        [{text: '❌ Отмена', callback_data: 'cancel'}]])}}));

scene.on('photo', ctx => b.all([
  ctx.persistent.deleteMessage(key),
  ctx.flow.enter(
    'admin.translation.update',
    {translation: r.assoc(
      'photo', r.last(ctx.message.photo).file_id,
      ctx.flow.state.translation)})]));

scene.action('skip', ctx => b.all([
  ctx.persistent.deleteMessage(key),
  ctx.flow.enter('admin.translation.update', {
    translation: ctx.flow.state.translation})]));

scene.action('cancel', ctx => b.all([
  ctx.persistent.deleteMessage(key),
  ctx.flow.enter('admin.translation.view', {
    translation: ctx.flow.state.translation.id})]));

export default scene;
