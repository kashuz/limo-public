import { Scene } from 'telegraf-flow';
import { Extra } from 'telegraf';

const scene = new Scene('menu');

scene.enter(ctx => {
  ctx.reply(
    'Menu',
    Extra.markup(markup =>
      markup.inlineKeyboard(
        [
          markup.callbackButton('New order', 'menu.order'),
          markup.callbackButton('Plans', 'menu.plans'),
          markup.callbackButton('My orders', 'menu.history'),
          markup.callbackButton('Change phone', 'menu.phone-number'),
        ],
        { columns: 1 },
      ),
    ),
  );
});

const map = {
  order: 'order.create',
  plans: 'plans',
  history: 'orders.list',
  'phone-number': 'settings.phone-number',
};

scene.action(/menu\.(.+)/, ctx =>
  ctx
    .answerCallbackQuery()
    .then(() => ctx.deleteMessage())
    .then(() => map[ctx.match[1]] && ctx.flow.enter(map[ctx.match[1]])),
);

export default scene;
