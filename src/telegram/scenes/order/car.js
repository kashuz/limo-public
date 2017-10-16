import b from 'bluebird';
import r from 'ramda';
import rs from 'ramdasauce';
import {Scene} from 'telegraf-flow';
import db from '../../../db';
import update from '../../../sql/update-order';
import {initial, full} from '../../keyboards/car';
import cost from '../../../util/cost';

const scene = new Scene('order.car');
const key = 'order.car.message';

function categories() {
  return db('category')
    .whereIn('id', function sub() {
      this.select('category_id').from('car')})
    .orderBy('position');
}

function cars(category) {
  return db('car')
    .where({category_id: category})
    .orderBy('position');
}

function above(length, index) {
  return index < length ? index : 0;
}

function below(length, index) {
  return index < 0 ? length - 1 : index;
}

function prepare(category, car, time, duration) {
  return b
    .all([categories(), cars(category)])
    .then(([categories, cars]) => [
      categories, cars,
      r.find(r.propEq('id', category), categories),
      car && r.findIndex(r.propEq('id', car), cars)])
    .then(([categories, cars, category, index]) => [
      cars[index].photo,
      full(categories, cars, category.id, index,
        below(cars.length, index - 1),
        above(cars.length, index + 1),
        cost(category, time, duration))]);
}

scene.enter(ctx => ctx.flow.state.order.category_id
  ? prepare(
        ctx.flow.state.order.category_id,
        ctx.flow.state.order.car_id || 0,
        ctx.flow.state.order.time,
        ctx.flow.state.order.duration)
      .tap(() => ctx.persistent.deleteMessage(key))
      .then(([photo, extra]) =>
        ctx.persistent.sendPhoto(key, photo, extra))
  : categories().then(categories =>
      ctx.persistent.sendMessage(key,
        'Пожалуйста выберите класс', initial(categories))));

scene.action('cancel', ctx => b.all([
  ctx.persistent.deleteMessage(key),
  ctx.flow.enter('order.create', {order: ctx.flow.state.order})]));

scene.action(/category\.(\d+)/, ctx =>
  prepare(
      +ctx.match[1], 0,
      ctx.flow.state.order.time,
      ctx.flow.state.order.duration)
    .tap(() => ctx.persistent.deleteMessage(key))
    .then(([photo, extra]) =>
      ctx.persistent.sendPhoto(key, photo, extra)));

scene.action(/skip\.(\d+)\.(\d+)/, ctx =>
  prepare(
      +ctx.match[1], +ctx.match[2],
      ctx.flow.state.order.time,
      ctx.flow.state.order.duration)
    .tap(() => ctx.persistent.deleteMessage(key))
    .then(([photo, extra]) =>
      ctx.persistent.sendPhoto(key, photo, extra)));

scene.action(/select\.(\d+)\.(\d+)/, ctx =>
  update(ctx.flow.state.order.id, {
    category_id: ctx.match[1],
    car_id: ctx.match[2]})
  .then(order => b.all([
    ctx.answerCallbackQuery('Машина выбрана'),
    ctx.persistent.deleteMessage(key),
    ctx.flow.enter('order.create', {order})])));

scene.action(/random\.(\d+)/, ctx =>
  update(ctx.flow.state.order.id, {
      category_id: ctx.match[1],
      car_id: null})
    .then(order => b.all([
      ctx.answerCallbackQuery('Класс выбран'),
      ctx.persistent.deleteMessage(key),
      ctx.flow.enter('order.create', {order})])));

scene.use((ctx, next) =>
  ctx.persistent.deleteMessage(key)
    .then(categories)
    .then(categories => ctx.persistent.sendMessage(key,
      'Пожалуйста выберите класс', initial(categories)))
    .then(() => next()));

export default scene;
