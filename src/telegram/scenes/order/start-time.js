import b from 'bluebird';
import { Scene } from 'telegraf-flow';
import action from '../../action';
import clock from '../../keyboards/clock';

const { reply, reset, remove } = action('scene.order.start-time.message');
const scene = new Scene('order.start-time');

scene.enter(ctx => reply(ctx, 'Please choose start time', clock()));

scene.action(/time\.(\d+:\d+)/, ctx =>
  ctx.answerCallbackQuery().then(() =>
    b.all([
      remove(ctx),
      ctx.flow.enter('order.finish-time', {
        order: ctx.flow.state.order,
        start: ctx.match[1],
      }),
    ]),
  ),
);

scene.action('cancel', ctx =>
  b.all([
    reset(ctx),
    ctx.flow.enter('order.create', { order: ctx.flow.state.order }),
  ]),
);

scene.action('noop', ctx =>
  ctx.answerCallbackQuery('Please choose start time'),
);

scene.use((ctx, next) =>
  reply(ctx, 'Please choose start time', clock()).then(next),
);

export default scene;
