import r from 'ramda';
import b from 'bluebird';
import { Scene } from 'telegraf-flow';
import db from '../../../db';
import action from '../../action';
import clock from '../../keyboards/clock';

const { reply, reset } = action('scene.order.finish-time.message');
const scene = new Scene('order.finish-time');

function update(id, start, finish) {
  return db('order')
    .update({ start_time: start, finish_time: finish })
    .where({ id })
    .returning('*')
    .then(r.head);
}

scene.enter(ctx =>
  reply(ctx, 'Please choose end time', clock(ctx.flow.state.start)),
);

scene.action(/time\.(\d+:\d+)/, ctx =>
  ctx.answerCallbackQuery().then(() =>
    update(ctx.flow.state.id, ctx.flow.state.start, ctx.match[1])
      .tap(() => ctx.reply('✅ Time saved'))
      .then(order =>
        b.all([reset(ctx), ctx.flow.enter('order.create', order)]),
      ),
  ),
);

scene.action('cancel', ctx =>
  b.all([reset(ctx), ctx.flow.enter('order.create', ctx.flow.state)]),
);

scene.action('noop', ctx => ctx.answerCallbackQuery('Please choose end time'));

scene.use((ctx, next) =>
  reply(ctx, 'Please choose end time', clock(ctx.flow.state.start)).then(next),
);

export default scene;
