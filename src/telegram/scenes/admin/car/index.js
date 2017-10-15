import r from 'ramda';
import rs from 'ramdasauce';
import b from 'bluebird';
import {Scene} from 'telegraf-flow';
import db from '../../../../db';
import concat from '../../../../util/concat';

const scene = new Scene('admin.car.index');

scene.enter(ctx => db('car')
  .where('category_id', ctx.flow.state.category).orderBy('position').then(
    cars => ctx
      .reply('Выберите машину или создайте новую', {
        reply_markup: {
          inline_keyboard: concat([
            r.map(
              car => [{text: `${car.position}. ${car.name}`, callback_data: `car.${car.id}`}],
              cars),
            [[{text: '❇️ Создать', callback_data: 'create'}],
             [{text: '⬅ Назад', callback_data: 'back'}]]])}})));

scene.action(/car\.(\d+)/, ctx => b.all([
  ctx.deleteMessage(),
  ctx.flow.enter('admin.car.view', {
    category: ctx.flow.state.category,
    car: ctx.match[1]})]));

scene.action('create', ctx => b.all([
  ctx.deleteMessage(),
  ctx.flow.enter('admin.car.form.name', {
    car: {
      category_id: ctx.flow.state.category},
    success: {
      scene: 'admin.car.create'},
    cancel: {
      scene: 'admin.car.index',
      state: {category: ctx.flow.state.category}}})]));

scene.action('back', ctx => b.all([
  ctx.deleteMessage(),
  ctx.flow.enter('admin.car.category')]));

export default scene;
