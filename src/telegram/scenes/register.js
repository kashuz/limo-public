import {Scene} from 'telegraf-flow';
import db from '../../db';

const scene = new Scene('register');

const extra = {
  reply_markup: {
    resize_keyboard: true,
    keyboard: [[{text: '☎️ Send phone number', request_contact: true}]]}};

scene.enter(ctx => ctx.reply('Please send your phone number', extra));

scene.on('contact', ctx =>
  db('user')
    .update({phone_number: ctx.message.contact.phone_number})
    .where({id: ctx.user.id})
    .then(() => ctx.answerCallbackQuery('Phone number saved', {
      reply_markup: {
        remove_keyboard: true}}))
    .then(() => ctx.flow.enter('agreement')));

scene.use((ctx, next) =>
  ctx.reply('Please send your phone number', extra)
    .then(() => next()));

export default scene;
