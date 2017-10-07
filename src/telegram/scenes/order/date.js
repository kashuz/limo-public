import b from 'bluebird';
import r from 'ramda';
import { Scene } from 'telegraf-flow';
import db from '../../../db';
import action from '../../action';
import { init } from '../../../util/calendar';
import { date } from '../../../util/date';
import calendar from '../../keyboards/calendar';

const { reply, reset } = action('scene.date.location.message');
const scene = new Scene('order.date');

// eslint-disable-next-line no-shadow
function update(id, date) {
  return db('order')
    .update({ date })
    .where({ id })
    .returning('*')
    .then(r.head);
}

scene.enter(ctx =>
  reply(ctx, 'Please choose date', calendar(init(ctx.flow.state.date))),
);

scene.action(/month\.(\d+)\.(\d+)/, ctx =>
  ctx
    .editMessageReplyMarkup(calendar([ctx.match[1], ctx.match[2]]).reply_markup)
    .then(() => ctx.answerCallbackQuery()),
);

scene.action(/day\.(\d+)\.(\d+)\.(\d+)/, ctx =>
  update(ctx.flow.state.id, date(ctx.match[1], ctx.match[2], ctx.match[3]))
    .tap(() => ctx.reply('✅ Date saved'))
    .then(order =>
      b.all([reset(ctx), ctx.flow.enter('order.start-time', order)]),
    ),
);

scene.action('noop', ctx => ctx.answerCallbackQuery('Please choose date'));

scene.action('cancel', ctx =>
  b.all([reset(ctx), ctx.flow.enter('order.create', ctx.flow.state)]),
);

scene.use((ctx, next) =>
  reply(ctx, 'Please choose date', calendar(init())).then(next),
);

export default scene;
