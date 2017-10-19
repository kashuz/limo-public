import r from 'ramda';
import b from 'bluebird';
import {Scene} from 'telegraf-flow';
import db from '../../../../db';
import outdent from 'outdent';

const scene = new Scene('admin.car.create');

scene.enter(ctx => ctx
  .replyWithPhoto(ctx.flow.state.car.photo, {
    caption: outdent`
      Название: ${ctx.flow.state.car.name}
      Ссылка: ${ctx.flow.state.car.link}
      Позиция: ${ctx.flow.state.car.position}`,
    reply_markup: {
      inline_keyboard: [[
        {text: '❌ Отмена', callback_data: 'no'},
        {text: '💾 Сохранить', callback_data: 'yes'}]]}}));

scene.action('yes', ctx => db('car')
  .insert(ctx.flow.state.car)
  .returning('id')
  .then(r.head)
  .then(car => b.all([
    ctx.deleteMessage(),
    ctx.flow.enter('admin.car.view', {
      car,
      category: ctx.flow.state.car.category_id})])));

scene.action('no', ctx => b.all([
  ctx.deleteMessage(),
  ctx.flow.enter('admin.car.index', {
    category: ctx.flow.state.car.category_id})]));

export default scene;
