import b from 'bluebird';
import {Scene} from 'telegraf-flow';
import db from '../../../../db';

const scene = new Scene('admin.category.update');

scene.enter(ctx => ctx
  .reply(`${ctx.flow.state.category.position}. ${ctx.flow.state.category.name}`, {
    reply_markup: {
      inline_keyboard: [[
        {text: '❌ Отмена', callback_data: 'no'},
        {text: '💾 Сохранить', callback_data: 'yes'}]]}}));

scene.action('yes', ctx => db('category')
  .where('id', ctx.flow.state.category.id)
  .update(ctx.flow.state.category)
  .then(() => b.all([
    ctx.deleteMessage(),
    ctx.flow.enter('admin.category.view', {
      category: ctx.flow.state.category.id})])));

scene.action('no', ctx => b.all([
  ctx.deleteMessage(),
  ctx.flow.enter('admin.category.view', {
    category: ctx.flow.state.category.id})]));

export default scene;
