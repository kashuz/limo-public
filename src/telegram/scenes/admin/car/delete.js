import b from 'bluebird';
import {Scene} from 'telegraf-flow';
import db from '../../../../db';

const scene = new Scene('admin.car.delete');

scene.enter(ctx =>
  db('order').where('car_id', ctx.flow.state.car).count().then(
    ({count}) => ctx
      .reply(`${count ? `Существует ${count} заказов c этой машиной. ` : ''} Вы точно хотите удалить эту машину?`, {
        reply_markup: {
          inline_keyboard: [
            [{text: '⬅ Отмена', callback_data: 'no'},
             {text: '🚮 Удалить', callback_data: 'yes'}]]}})));

scene.action('yes', ctx => db('car')
  .where('id', ctx.flow.state.car)
  .delete()
  .then(() => b.all([
    ctx.deleteMessage(),
    ctx.flow.enter('admin.car.index', {
      category: ctx.flow.state.category})])));

scene.action('no', ctx => b.all([
  ctx.deleteMessage(),
  ctx.flow.enter('admin.car.view', {
    car: ctx.flow.state.car,
    category: ctx.flow.state.category})]));

export default scene;
