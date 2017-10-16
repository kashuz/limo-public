import b from 'bluebird';
import r from 'ramda';
import {Scene} from 'telegraf-flow';
import db from '../../../db';
import update from '../../../sql/update-order';
import extra from '../../keyboards/car';

const scene = new Scene('order.car');

function categories() {
  return db('category').whereIn('id', function sub() {
    this.select('category_id').from('car')});
}

function cars(category) {
  return db('car')
    .where({category_id: category})
    .orderBy('id');
}

function find(list, id) {
  return id ? r.findIndex(r.propEq('id', id), list) : 0;
}

function above(length, index) {
  return index < length ? index : 0;
}

function below(length, index) {
  return index < 0 ? length - 1 : index;
}

function show(ctx, category, car, time, duration) {
  return b
    .all([categories(), cars(category)])
    .then(([categories, cars]) => b.all([
      ctx.deleteMessage(),
      ctx.replyWithPhoto(
        cars[find(cars, car)].photo,
        extra(
          categories,
          cars,
          category,
          find(cars, car),
          below(cars.length, find(cars, car) - 1),
          above(cars.length, find(cars, car) + 1),
          time,
          duration))]));
}

function intro(ctx) {
  return categories().then(categories =>
    ctx.reply('Выберите класс', {
      reply_markup: {
        inline_keyboard: [
          categories.map(c => ({text: '◻️ ' + c.name, callback_data: `category.${c.id}`})),
          [{text: '⬅ Назад', callback_data: `cancel`}]]}}));
}

scene.enter(ctx => ctx.flow.state.order.category_id
  ? show(ctx, ctx.flow.state.order.category_id, ctx.flow.state.order.car_id, ctx.flow.state.order.time, ctx.flow.state.order.duration)
  : intro(ctx));

scene.action('cancel', ctx => b.all([
  ctx.deleteMessage(),
  ctx.flow.enter('order.create', {order: ctx.flow.state.order})]));

scene.action(/category\.(\d+)/, ctx =>
  show(ctx, +ctx.match[1], null, ctx.flow.state.order.time, ctx.flow.state.order.duration));

scene.action(/skip\.(\d+)\.(\d+)/, ctx =>
  show(ctx, +ctx.match[1], +ctx.match[2], ctx.flow.state.order.time, ctx.flow.state.order.duration));

scene.action(/select\.(\d+)\.(\d+)/, ctx =>
  update(ctx.flow.state.order.id, {
      category_id: ctx.match[1],
      car_id: ctx.match[2]})
    .then(order => b.all([
      ctx.answerCallbackQuery('Машина выбрана'),
      ctx.deleteMessage(),
      ctx.flow.enter('order.create', {order})])));

scene.action(/random\.(\d+)/, ctx =>
  update(ctx.flow.state.order.id, {
      category_id: ctx.match[1],
      car_id: null})
    .then(order => b.all([
      ctx.answerCallbackQuery('Класс выбран'),
      ctx.deleteMessage(),
      ctx.flow.enter('order.create', {order})])));

scene.use(ctx => intro(ctx));

export default scene;
