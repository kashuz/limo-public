import b from 'bluebird';
import { Scene } from 'telegraf-flow';
import action from '../../action';
import vertical from '../../keyboards/vertical';
import { format as address } from '../../../util/geo';
import { format as date } from '../../../util/date';

const { reply, reset } = action('scene.order.create.message');
const scene = new Scene('order.create');

const keyboard = vertical({
  '📍 Location': `location`,
  '🚗 Car': `car`,
  '🗓 Date': `date`,
  '⏰ Time': `time`,
  '📝 Notes': `note`,
  '💳 Payment method': `payment`,
  '❌ Cancel': `cancel`,
}).HTML();

function hours(o) {
  return o.finish_time.split(':')[0] - o.start_time.split(':')[0];
}

function format(o) {
  return `
Order <b>#${o.id}</b>
📍 ${o.location ? address(o.location) : 'Location: <i> not set</i>'}
🗓 ${o.date ? `${date(o.date)}` : 'Date: <i> not set</i>'}
⏰ ${o.start_time
    ? `${o.start_time} - ${o.finish_time}, ${hours(o)} hour(s)`
    : 'Time: <i> not set</i>'}
📝 ${o.note || 'Notes: <i> no set</i>'}`;
}

scene.enter(ctx => reply(ctx, format(ctx.flow.state), keyboard));

scene.action('location', ctx =>
  b.all([reset(ctx), ctx.flow.enter('order.location', ctx.flow.state)]),
);

scene.action('date', ctx =>
  b.all([reset(ctx), ctx.flow.enter('order.date', ctx.flow.state)]),
);

scene.action('time', ctx =>
  b.all([reset(ctx), ctx.flow.enter('order.start-time', ctx.flow.state)]),
);

scene.action('note', ctx =>
  b.all([reset(ctx), ctx.flow.enter('order.note', ctx.flow.state)]),
);

scene.action('cancel', ctx =>
  ctx
    .reply('Order cancelled')
    .then(() => b.all([reset(ctx), ctx.flow.enter('menu')])),
);

scene.action(/(.+)/, ctx =>
  ctx.answerCallbackQuery(`Not implemented ${ctx.match[1]}`),
);

scene.use((ctx, next) =>
  reply(ctx, format(ctx.flow.state), keyboard).then(next),
);

export default scene;
