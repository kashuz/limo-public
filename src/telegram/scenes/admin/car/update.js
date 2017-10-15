import b from 'bluebird';
import {Scene} from 'telegraf-flow';
import db from '../../../../db';

const scene = new Scene('admin.car.update');

scene.enter(ctx => ctx
  .replyWithPhoto(ctx.flow.state.car.photo, {
    caption: `${ctx.flow.state.car.position}. ${ctx.flow.state.car.name}\n${ctx.flow.state.car.link}`,
    reply_markup: {
      inline_keyboard: [[
        {text: '❌ Отмена', callback_data: 'no'},
        {text: '💾 Сохранить', callback_data: 'yes'}]]}}));

scene.action('yes', ctx => db('car')
  .where('id', ctx.flow.state.car.id)
  .update(ctx.flow.state.car)
  .then(() => b.all([
    ctx.deleteMessage(),
    ctx.flow.enter('admin.car.view', {
      car: ctx.flow.state.car.id,
      category: ctx.flow.state.car.category_id})])));

scene.action('no', ctx => b.all([
  ctx.deleteMessage(),
  ctx.flow.enter('admin.car.view', {
    car: ctx.flow.state.car.id,
    category: ctx.flow.state.car.category_id})]));

export default scene;
