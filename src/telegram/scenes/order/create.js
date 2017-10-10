import b from 'bluebird';
import r from 'ramda';
import { Scene } from 'telegraf-flow';
import db from '../../../db';
import action from '../../action';
import { format as address } from '../../../util/geo';
import { format as date } from '../../../util/date';

const { reply, reset } = action('scene.order.create.message');
const scene = new Scene('order.create');

function extra(order) {
  return {
    parse_mode: 'html',
    reply_markup: {
      inline_keyboard: [
        [{ text: '📍 Location', callback_data: 'location' }],
        [{ text: '🚗 Car', callback_data: 'car' }],
        [
          { text: '🗓 Date', callback_data: 'date' },
          { text: '⏰ Time', callback_data: 'start-time' },
        ],
        [
          {
            text: `${order.payment === 'payme' ? '◼️' : '◻️'} Payme`,
            callback_data: 'payment.payme',
          },
          {
            text: `${order.payment === 'cash' ? '◼️' : '◻️'} Cash`,
            callback_data: 'payment.cash',
          },
        ],
        [{ text: '📝 Notes', callback_data: 'note' }],
        [{ text: '❌ Cancel', callback_data: 'cancel' }],
      ],
    },
  };
}

const props = [
  ['location', 'Location: not set', address],
  [
    'category',
    'Car: not set',
    (category, { car }) => `${car || 'Random car'} from class ${category}`,
  ],
  ['date', 'Date: not set', date],
  [
    'start_time',
    'Time: not set',
    (start, { finish_time: finish }) =>
      `${start} - ${finish}, ${finish.split(':')[0] -
        start.split(':')[0]} hour(s)`,
  ],
  [
    'payment',
    'Payment method: not set',
    payment => (payment === 'payme' ? 'Payme' : 'Cash'),
  ],
];

function format(o) {
  return `Order <b>#${o.id}</b>\n\n${props
    .map(
      ([prop, empty, value]) =>
        `${o[prop] ? '✅' : '⭕️'} ${o[prop] ? value(o[prop], o) : empty}`,
    )
    .join(`\n`)}\n\n${o.note ? `Notes: <i>${o.note}</i>` : ''}`;
}

function join(order) {
  return db('order')
    .where({ 'order.id': order.id })
    .leftJoin('car', 'car.id', 'order.car_id')
    .leftJoin('category', 'category.id', 'order.category_id')
    .first('order.*', 'car.name as car', 'category.name as category');
}

function update(id, payment) {
  return db('order')
    .update({ payment })
    .where({ id })
    .returning('*')
    .then(r.head);
}

scene.enter(ctx =>
  join(ctx.flow.state.order).then(order =>
    reply(ctx, format(order), extra(order)),
  ),
);

scene.action(/(location|car|date|start-time|note)/, ctx =>
  b.all([
    reset(ctx),
    ctx.flow.enter(`order.${ctx.match[1]}`, { order: ctx.flow.state.order }),
  ]),
);

scene.action('cancel', ctx =>
  ctx
    .reply('Order cancelled')
    .then(() => b.all([reset(ctx), ctx.flow.enter('menu')])),
);

scene.action(/payment\.(payme|cash)/, ctx =>
  update(ctx.flow.state.order.id, ctx.match[1])
    .then(order => (ctx.flow.state.order = order))
    .then(join)
    .then(order => ctx.editMessageText(format(order), extra(order))),
);

scene.use((ctx, next) =>
  join(ctx.flow.state.order)
    .then(order => reply(ctx, format(order), extra(order)))
    .then(next),
);

export default scene;
