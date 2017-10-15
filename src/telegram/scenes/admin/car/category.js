import r from 'ramda';
import b from 'bluebird';
import {Scene} from 'telegraf-flow';
import db from '../../../../db';

const scene = new Scene('admin.car.category');

scene.enter(ctx =>
  db('category').orderBy('position').then(
    categories => ctx
      .reply('Выберите класс', {
        reply_markup: {
          inline_keyboard: r.append(
            [{text: '⬅ Назад', callback_data: 'back'}],
            r.map(
              category => [{text: category.name, callback_data: `category.${category.id}`}],
              categories))}})));

scene.action(/category\.(\d+)/, ctx => b.all([
  ctx.deleteMessage(),
  ctx.flow.enter('admin.car.index', {category: ctx.match[1]})]));

scene.action('back', ctx => b.all([
  ctx.deleteMessage(),
  ctx.flow.enter('admin.menu')]));

export default scene;
