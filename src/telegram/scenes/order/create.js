import b from 'bluebird';
import { Scene } from 'telegraf-flow';
import db from '../../../db';
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
🚘 ${o.category
    ? `${o.car || 'Random car'} from class ${o.category}`
    : 'Car: <i> no set</i>'}
🗓 ${o.date ? `${date(o.date)}` : 'Date: <i> not set</i>'}
⏰ ${o.start_time
    ? `${o.start_time} - ${o.finish_time}, ${hours(o)} hour(s)`
    : 'Time: <i> not set</i>'}
📝 ${o.note || 'Notes: <i> no set</i>'}
`;
}

function join(order) {
  return db('order')
    .where({ 'order.id': order.id })
    .leftJoin('car', 'car.id', 'order.car_id')
    .leftJoin('category', 'category.id', 'order.category_id')
    .first('order.*', 'car.name as car', 'category.name as category');
}

scene.enter(ctx =>
  join(ctx.flow.state.order).then(order => reply(ctx, format(order), keyboard)),
);

scene.action('location', ctx =>
  b.all([
    reset(ctx),
    ctx.flow.enter('order.location', { order: ctx.flow.state.order }),
  ]),
);

scene.action('car', ctx =>
  b.all([
    reset(ctx),
    ctx.flow.enter('order.car', { order: ctx.flow.state.order }),
  ]),
);

scene.action('date', ctx =>
  b.all([
    reset(ctx),
    ctx.flow.enter('order.date', { order: ctx.flow.state.order }),
  ]),
);

scene.action('time', ctx =>
  b.all([
    reset(ctx),
    ctx.flow.enter('order.start-time', { order: ctx.flow.state.order }),
  ]),
);

scene.action('note', ctx =>
  b.all([
    reset(ctx),
    ctx.flow.enter('order.note', { order: ctx.flow.state.order }),
  ]),
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
  join(ctx.flow.state.order)
    .then(order => reply(ctx, format(order), keyboard))
    .then(next),
);

export default scene;
