import b from 'bluebird';
import {Scene} from 'telegraf-flow';
import db from '../../../../db';

const scene = new Scene('admin.translation.view');

scene.enter(ctx =>
  db('translation').where('id', ctx.flow.state.translation).first().then(
    translation => ctx.reply(translation.text, {
      parse_mode: 'html',
      reply_markup: {
        inline_keyboard: [[
          {text: '⬅ Назад', callback_data: 'back'},
          {text: '✏ Изменить', callback_data: 'update'}]]}})));

scene.action('update', ctx =>
  db('translation').where('id', ctx.flow.state.translation).first().then(
    translation => b.all([
      ctx.deleteMessage(),
      ctx.flow.enter('admin.translation.form.text', {translation})])));

scene.action('back', ctx => b.all([
  ctx.deleteMessage(),
  ctx.flow.enter('admin.translation.index')]));

export default scene;
