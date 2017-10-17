import b from 'bluebird';
import {Scene} from 'telegraf-flow';
import db from '../../../../db';

const scene = new Scene('admin.translation.update');

scene.enter(ctx => ctx
  .reply(ctx.flow.state.translation.text, {
    parse_mode: 'html',
    reply_markup: {
      inline_keyboard: [[
        {text: '❌ Отмена', callback_data: 'no'},
        {text: '💾 Сохранить', callback_data: 'yes'}]]}}));

scene.action('yes', ctx => db('translation')
  .where('id', ctx.flow.state.translation.id)
  .update(ctx.flow.state.translation)
  .then(() => b.all([
    ctx.deleteMessage(),
    ctx.flow.enter('admin.translation.view', {
      translation: ctx.flow.state.translation.id})])));

scene.action('no', ctx => b.all([
  ctx.deleteMessage(),
  ctx.flow.enter('admin.translation.view', {
    translation: ctx.flow.state.translation.id})]));

export default scene;
