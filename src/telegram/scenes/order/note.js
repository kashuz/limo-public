import b from 'bluebird';
import r from 'ramda';
import { Scene } from 'telegraf-flow';
import { Extra as extra } from 'telegraf';
import db from '../../../db';
import action from '../../action';

const { reply, reset } = action('scene.order.note.message');
const scene = new Scene('order.note');

const keyboard = extra.markup(m =>
  m.inlineKeyboard([m.callbackButton('⬅ Back', `cancel`)]),
);

function update(id, note) {
  return db('order')
    .update({ note })
    .where({ id })
    .returning('*')
    .then(r.head);
}

scene.enter(ctx => reply(ctx, 'Please send notes', keyboard));

scene.action('cancel', ctx =>
  b.all([
    reset(ctx),
    ctx.flow.enter('order.create', { order: ctx.flow.state.order }),
  ]),
);

scene.on('text', ctx =>
  update(ctx.flow.state.order.id, ctx.message.text)
    .tap(() => ctx.reply('✅ Notes saved'))
    .then(order =>
      b.all([reset(ctx), ctx.flow.enter('order.create', { order })]),
    ),
);

scene.use((ctx, next) => reply(ctx, 'Please send notes', keyboard).then(next));

export default scene;
