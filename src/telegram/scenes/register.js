import {Scene} from 'telegraf-flow';
import db from '../../db';

const scene = new Scene('register');

const extra = {
  reply_markup: {
    resize_keyboard: true,
    keyboard: [[{text: '☎️ Отправьте номер телефона', request_contact: true}]]}};

scene.enter(ctx => ctx.reply('Пожалуйста отправьте номер телефона', extra));

scene.on('contact', ctx =>
  db('user')
    .update({phone_number: ctx.message.contact.phone_number})
    .where({id: ctx.user.id})
    .then(() => ctx.answerCallbackQuery('Номре телефона сохранен', {
      reply_markup: {
        remove_keyboard: true}}))
    .then(() => ctx.flow.enter('agreement')));

scene.use((ctx, next) =>
  ctx.reply('Пожалуйста отправьте номер телефона', extra)
    .then(() => next()));

export default scene;
