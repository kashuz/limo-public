import r from 'ramda';
import rs from 'ramdasauce';
import b from 'bluebird';
import {Scene} from 'telegraf-flow';
import db from '../../../../db';
import concat from '../../../../util/concat';

const scene = new Scene('admin.category.index');

scene.enter(ctx => db('category').orderBy('position').then(
    categories => ctx
      .reply('Выберите класс или создайте новый', {
        reply_markup: {
          inline_keyboard: concat([
            r.map(
              category => [{text: `${category.position}. ${category.name}`, callback_data: `category.${category.id}`}],
              categories),
            [[{text: '❇️ Создать', callback_data: 'create'}],
             [{text: '⬅ Назад', callback_data: 'back'}]]])}})));

scene.action(/category\.(\d+)/, ctx => b.all([
  ctx.deleteMessage(),
  ctx.flow.enter('admin.category.view', {
    category: ctx.match[1]})]));

scene.action('create', ctx => b.all([
  ctx.deleteMessage(),
  ctx.flow.enter('admin.category.form.name', {
    category: {},
    success: {scene: 'admin.category.create'},
    cancel: {scene: 'admin.category.index'}})]));

scene.action('back', ctx => b.all([
  ctx.deleteMessage(),
  ctx.flow.enter('admin.menu')]));

export default scene;
