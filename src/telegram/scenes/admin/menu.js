import b from 'bluebird';
import {Scene} from 'telegraf-flow';

const scene = new Scene('admin.menu');

scene.enter(ctx => ctx
  .reply('Меню администрирования', {
    reply_markup: {
      inline_keyboard: [
        [{text: 'Машины', callback_data: 'car'}],
        [{text: 'Классы', callback_data: 'category'}],
        [{text: '⬅ Назад', callback_data: 'back'}]]}}));

scene.action('car', ctx => b.all([
  ctx.deleteMessage(),
  ctx.flow.enter('admin.car.category')]));

scene.action('category', ctx => b.all([
  ctx.deleteMessage(),
  ctx.flow.enter('admin.category.index')]));

scene.action('back', ctx => b.all([
  ctx.deleteMessage(),
  ctx.flow.enter('menu')]));

export default scene;
