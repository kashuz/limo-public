import r from 'ramda';
import b from 'bluebird';
import {Scene} from 'telegraf-flow';
import compact from '../../../../../util/compact';

const scene = new Scene('admin.category.form.position');
const key = 'admin.category.form.position';

scene.enter(ctx => ctx.persistent
  .sendMessage(key, 'Отправьте позицию', {
    reply_markup: {
      inline_keyboard: compact([
        'position' in ctx.flow.state.category &&
          [{text: '⏩ Пропустить', callback_data: 'skip'}],
        [{text: '❌ Отмена', callback_data: 'cancel'}]])}}));

scene.hears(/(\d+)/, ctx => b.all([
  ctx.persistent.deleteMessage(key),
  ctx.flow.enter(ctx.flow.state.success.scene, {
    category: r.assoc(
      'position', ctx.message.text,
      ctx.flow.state.category)})]));

scene.action('skip', ctx => b.all([
  ctx.persistent.deleteMessage(key),
  ctx.flow.enter(ctx.flow.state.success.scene, {
    category: ctx.flow.state.category})]));

scene.action('cancel', ctx => b.all([
  ctx.persistent.deleteMessage(key),
  ctx.flow.enter(ctx.flow.state.cancel.scene, ctx.flow.state.cancel.state)]));

export default scene;
