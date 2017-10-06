import { Scene } from 'telegraf-flow';
import { Extra } from 'telegraf';
import db from '../../db';

const scene = new Scene('register');

scene.enter(ctx => {
  ctx.reply(
    'You need to register. Please send your phone number',
    Extra.markup(markup =>
      markup.resize().keyboard([markup.contactRequestButton('Send contact')]),
    ),
  );
});

scene.on('contact', ctx =>
  db('user')
    .update({ phone_number: ctx.message.contact.phone_number })
    .where({ id: ctx.user.id })
    .then(() => {
      ctx.user.phone_number = ctx.message.contact.phone_number;
      return ctx.reply(
        'Your phone number successfully stored',
        Extra.markup(markup => markup.removeKeyboard()),
      );
    })
    .then(() => ctx.flow.enter('agreement')),
);

export default scene;
