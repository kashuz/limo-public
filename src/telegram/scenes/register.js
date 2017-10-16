import b from 'bluebird';
import {Scene} from 'telegraf-flow';
import db from '../../db';

const scene = new Scene('register');
const key = 'scene.register.message';

const extra = {
  reply_markup: {
    resize_keyboard: true,
    keyboard: [[{text: '☎️ Отправьте номер телефона', request_contact: true}]]}};

scene.enter(ctx => ctx.persistent
  .sendMessage(key,
    'Пожалуйста отправьте номер телефона', extra));

scene.on('contact', ctx =>
  db('user')
    .update({phone_number: ctx.message.contact.phone_number.replace(/\+/g, '')})
    .where({id: ctx.user.id})
    .then(() => b.all([
      ctx.util.removeKeyboard(),
      ctx.flow.enter('agreement')])));

scene.use((ctx, next) =>
  ctx.persistent.deleteMessage(key)
    .then(() => ctx.persistent.sendMessage(key,
      'Пожалуйста отправьте номер телефона', extra))
    .then(() => next()));

export default scene;
