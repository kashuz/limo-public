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
  '🗓 Date and time': `datetime`,
  '📝 Notes': `note`,
  '💳 Payment method': `payment`,
  '❌ Cancel': `cancel`,
});

function format(order) {
  return `
Order #${order.id}
📍 ${order.location ? address(order.location) : 'Location not set'}
🗓 ${order.date ? date(order.date) : 'Date not set'}
`;
}

scene.enter(ctx => reply(ctx, format(ctx.flow.state), keyboard));

scene.action('location', ctx =>
  b.all([reset(ctx), ctx.flow.enter('order.location', ctx.flow.state)]),
);

scene.action('datetime', ctx =>
  b.all([reset(ctx), ctx.flow.enter('order.date', ctx.flow.state)]),
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
