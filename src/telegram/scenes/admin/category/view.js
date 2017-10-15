import r from 'ramda';
import b from 'bluebird';
import {Scene} from 'telegraf-flow';
import db from '../../../../db';

const scene = new Scene('admin.category.view');

scene.enter(ctx =>
  db('category').where('id', ctx.flow.state.category).first().then(
    category => ctx
      .reply(`${category.position}. ${category.name}`, {
        reply_markup: {
          inline_keyboard: [
            [{text: '✏ Изменить', callback_data: 'update'},
             {text: '❌ Удалить', callback_data: 'delete'}],
            [{text: '⬅ Назад', callback_data: 'back'}]]}})));

scene.action('update', ctx =>
  db('category').where('id', ctx.flow.state.category).first().then(
    category => b.all([
      ctx.deleteMessage(),
      ctx.flow.enter('admin.category.form.name', {
        category,
        success: {scene: 'admin.category.update'},
        cancel: {
          scene: 'admin.category.view',
          state: {category: ctx.flow.state.category}}})])));

scene.action('delete', ctx => b.all([
  ctx.deleteMessage(),
  ctx.flow.enter('admin.category.delete', {
    category: ctx.flow.state.category})]));

scene.action('back', ctx => b.all([
  ctx.deleteMessage(),
  ctx.flow.enter('admin.category.index')]));

export default scene;
