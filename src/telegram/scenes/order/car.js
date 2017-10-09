import b from 'bluebird';
import r from 'ramda';
import { Scene } from 'telegraf-flow';
import db from '../../../db';

const scene = new Scene('order.car');

function update(id, category, car) {
  return db('order')
    .update({ category_id: category, car_id: car })
    .where({ id })
    .returning('*')
    .then(r.head);
}

function categories() {
  return db('category').whereIn('id', function sub() {
    this.select('category_id').from('car');
  });
}

function cars(category) {
  return db('car')
    .where({ category_id: category })
    .orderBy('id');
}

function find(list, id) {
  return id ? r.findIndex(r.propEq('id', id), list) : 0;
}

function above(length, index) {
  return index < length ? index : 0;
}

function below(length, index) {
  return index < 0 ? length - 1 : index;
}

function extra(categories, cars, category, position, prev, next) {
  return {
    caption: r.join('\n', [
      `Model: ${cars[position].name}`,
      `More info: ${cars[position].link}`,
      `(${position + 1} of ${cars.length})`,
    ]),
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '◀️',
            callback_data: `skip.${category}.${cars[prev].id}`,
          },
          {
            text: 'Select',
            callback_data: `select.${category}.${cars[position].id}`,
          },
          {
            text: '▶️',
            callback_data: `skip.${category}.${cars[next].id}`,
          },
        ],
        [{ text: '🎲 Random', callback_data: `random.${category}` }],
        categories.map(c => ({
          text: category === c.id ? `✅ ${c.name}` : c.name,
          callback_data: `category.${c.id}`,
        })),
        [{ text: '⬅ Back', callback_data: `cancel` }],
      ],
    },
  };
}

function show(ctx, category, car) {
  return b
    .all([categories(), cars(category)])
    .then(([categories, cars]) =>
      b.all([
        ctx.replyWithPhoto(
          cars[find(cars, car)].photo,
          extra(
            categories,
            cars,
            category,
            find(cars, car),
            below(cars.length, find(cars, car) - 1),
            above(cars.length, find(cars, car) + 1),
          ),
        ),
        ctx.deleteMessage(),
      ]),
    );
}

function intro(ctx) {
  return categories().then(categories =>
    ctx.reply('Please select class', {
      reply_markup: {
        inline_keyboard: [
          categories.map(c => ({
            text: c.name,
            callback_data: `category.${c.id}`,
          })),
          [{ text: '⬅ Back', callback_data: `cancel` }],
        ],
      },
    }),
  );
}

scene.enter(
  ctx =>
    ctx.flow.state.order.category_id
      ? show(ctx, ctx.flow.state.order.category_id, ctx.flow.state.order.car_id)
      : intro(ctx),
);

scene.action('cancel', ctx =>
  b.all([
    ctx.editMessageReplyMarkup({
      inline_keyboard: [],
    }),
    ctx.flow.enter('order.create', { order: ctx.flow.state.order }),
  ]),
);

scene.action(/category\.(\d+)/, ctx => show(ctx, +ctx.match[1], null));

scene.action(/skip\.(\d+)\.(\d+)/, ctx =>
  show(ctx, +ctx.match[1], +ctx.match[2]),
);

scene.action(/select\.(\d+)\.(\d+)/, ctx =>
  update(ctx.flow.state.order.id, ctx.match[1], ctx.match[2])
    .tap(() => ctx.reply('✅ Car selected'))
    .then(order =>
      b.all([
        ctx.editMessageReplyMarkup({
          inline_keyboard: [],
        }),
        ctx.flow.enter('order.create', { order }),
      ]),
    ),
);

scene.action(/random\.(\d+)/, ctx =>
  update(ctx.flow.state.order.id, ctx.match[1], null)
    .tap(() => ctx.reply('✅ Random selected'))
    .then(order =>
      b.all([
        ctx.editMessageReplyMarkup({
          inline_keyboard: [],
        }),
        ctx.flow.enter('order.create', { order }),
      ]),
    ),
);

scene.use(ctx => intro(ctx));

export default scene;
