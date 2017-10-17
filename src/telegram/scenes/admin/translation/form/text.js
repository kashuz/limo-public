import r from 'ramda';
import b from 'bluebird';
import {Scene} from 'telegraf-flow';
import compact from '../../../../../util/compact';

const scene = new Scene('admin.translation.form.text');
const key = 'admin.translation.form.text';

scene.enter(ctx => ctx.persistent
  .sendMessage(key, 'Отправьте текст', {
    reply_markup: {
      inline_keyboard: compact([
        [{text: '❌ Отмена', callback_data: 'cancel'}]])}}));

scene.on('text', ctx => b.all([
  ctx.persistent.deleteMessage(key),
  ctx.flow.enter('admin.translation.update', {
    translation: r.assoc(
      'text', ctx.message.text,
      ctx.flow.state.translation)})]));

scene.action('cancel', ctx => b.all([
  ctx.persistent.deleteMessage(key),
  ctx.flow.enter('admin.translation.view', {
    translation: ctx.flow.state.translation.id})]));

export default scene;
