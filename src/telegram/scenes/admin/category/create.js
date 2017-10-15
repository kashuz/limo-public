import r from 'ramda';
import b from 'bluebird';
import {Scene} from 'telegraf-flow';
import db from '../../../../db';

const scene = new Scene('admin.category.create');

scene.enter(ctx => ctx
  .reply(`${ctx.flow.state.category.position}. ${ctx.flow.state.category.name}`, {
    reply_markup: {
      inline_keyboard: [[
        {text: '❌ Отмена', callback_data: 'no'},
        {text: '❇️💾 Сохранить', callback_data: 'yes'}]]}}));

scene.action('yes', ctx => db('category')
  .insert(ctx.flow.state.category)
  .returning('id')
  .then(r.head)
  .then(category => b.all([
    ctx.deleteMessage(),
    ctx.flow.enter('admin.category.view', {category})])));

scene.action('no', ctx => b.all([
  ctx.deleteMessage(),
  ctx.flow.enter('admin.category.index')]));

export default scene;
