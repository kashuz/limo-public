import { Scene } from 'telegraf-flow';
import { Extra as extra } from 'telegraf';
import db from '../../db';
import empty from '../keyboards/empty';

const scene = new Scene('register');

const keyboard = extra.markup(m =>
  m.resize().keyboard([m.contactRequestButton('☎️ Send phone number')]),
);

scene.enter(ctx => ctx.reply('Please send your phone number', keyboard));

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
  ctx.reply('Please send your phone number', keyboard).then(next),
);

export default scene;
