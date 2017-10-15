import r from 'ramda';
import b from 'bluebird';
import {Scene} from 'telegraf-flow';
import compact from '../../../../../util/compact';

const scene = new Scene('admin.car.form.link');
const key = 'admin.car.form.link';

scene.enter(ctx => ctx.persistent
  .sendMessage(key, 'Отправьте ссылку', {
    reply_markup: {
      inline_keyboard: compact([
        'link' in ctx.flow.state.car &&
          [{text: '⏩ Пропустить', callback_data: 'skip'}],
        [{text: '❌ Отмена', callback_data: 'cancel'}]])}}));

scene.hears(/https?:\/\//, ctx => b.all([
  ctx.persistent.deleteMessage(key),
  ctx.flow.enter('admin.car.form.position', r.assocPath(
    ['car', 'link'], ctx.message.text,
    ctx.flow.state))]));

scene.action('skip', ctx => b.all([
  ctx.persistent.deleteMessage(key),
  ctx.flow.enter('admin.car.form.position', ctx.flow.state)]));

scene.action('cancel', ctx => b.all([
  ctx.persistent.deleteMessage(key),
  ctx.flow.enter(ctx.flow.state.cancel.scene, ctx.flow.state.cancel.state)]));

export default scene;
