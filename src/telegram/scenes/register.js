import { Scene } from 'telegraf-flow';
import db from '../../db';

const scene = new Scene('register');

const extra = {
  reply_markup: {
    resize_keyboard: true,
    keyboard: [[{ text: '☎️ Send phone number', request_contact: true }]],
  },
};

const empty = {
  reply_markup: {
    remove_keyboard: true,
  },
};

scene.enter(ctx => ctx.reply('Please send your phone number', extra));

function update(id, phone) {
  return db('user')
    .update({ phone_number: phone })
    .where({ id });
}

scene.on('contact', ctx =>
  update(ctx.user.id, ctx.message.contact.phone_number)
    .then(() => ctx.reply('✅ Phone number saved', empty))
    .then(() => ctx.flow.enter('agreement')),
);

scene.use((ctx, next) =>
  ctx.reply('Please send your phone number', extra).then(next),
);

export default scene;
