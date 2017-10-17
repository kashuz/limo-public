import r from 'ramda';
import b from 'bluebird';
import {Scene} from 'telegraf-flow';
import db from '../../../../db';
import concat from '../../../../util/concat';

const scene = new Scene('admin.translation.index');

scene.enter(ctx => db('translation').orderBy('text').then(
  translations => ctx
    .reply('Выберите текст', {
      reply_markup: {
        inline_keyboard: concat([
          r.splitEvery(2, r.map(
            translation => ({text: translation.id, callback_data: `translation.${translation.id}`}),
            translations)),
          [[{text: '⬅ Назад', callback_data: 'back'}]]])}})));

scene.action(/translation\.(.+)/, ctx => b.all([
  ctx.deleteMessage(),
  ctx.flow.enter('admin.translation.view', {
    translation: ctx.match[1]})]));

scene.action('back', ctx => b.all([
  ctx.deleteMessage(),
  ctx.flow.enter('admin.menu')]));

export default scene;
