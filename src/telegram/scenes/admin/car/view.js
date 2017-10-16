import b from 'bluebird';
import {Scene} from 'telegraf-flow';
import db from '../../../../db';
import outdent from 'outdent';

const scene = new Scene('admin.car.view');

scene.enter(ctx =>
  db('car').where('id', ctx.flow.state.car).first().then(
    car => ctx
      .replyWithPhoto(car.photo, {
        caption: outdent`
          Название: ${car.name}
          Ссылка: ${car.link}
          Позиция: ${car.position}`,
        reply_markup: {
          inline_keyboard: [
            [{text: '✏ Изменить', callback_data: 'update'},
             {text: '❌ Удалить', callback_data: 'delete'}],
            [{text: '⬅ Назад', callback_data: 'back'}]]}})));

scene.action('update', ctx =>
  db('car').where('id', ctx.flow.state.car).first().then(
    car => b.all([
      ctx.deleteMessage(),
      ctx.flow.enter('admin.car.form.name', {
        car,
        success: {
          scene: 'admin.car.update'},
        cancel: {
          scene: 'admin.car.view',
          state: {
            car: ctx.flow.state.car,
            category: ctx.flow.state.category}}})])));

scene.action('delete', ctx => b.all([
  ctx.deleteMessage(),
  ctx.flow.enter('admin.car.delete', {
    car: ctx.flow.state.car,
    category: ctx.flow.state.category})]));

scene.action('back', ctx => b.all([
  ctx.deleteMessage(),
  ctx.flow.enter('admin.car.index', {
    category: ctx.flow.state.category})]));

export default scene;
