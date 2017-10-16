import r from 'ramda';
import b from 'bluebird';
import {Scene} from 'telegraf-flow';
import db from '../../../../db';
import {format} from '../../../../util/cost';
import outdent from 'outdent';

const scene = new Scene('admin.category.view');

scene.enter(ctx =>
  db('category').where('id', ctx.flow.state.category).first().then(
    category => ctx
      .reply(outdent`
          Название: <b>${category.name}</b>
          Позиция: <b>${category.position}</b>
          Минимальная цена: <b>${format(category.min_price)}</b>
          1 дневной час: <b>${format(category.day_hour_price)}</b>
          1 ночной час: <b>${format(category.night_hour_price)}</b>
          5 часов: <b>${format(category.five_hours_price)}</b>
          12 часов: <b>${format(category.twelve_hours_price)}</b>`, {
        parse_mode: 'html',
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
