import Telegraf from 'telegraf';
import r from 'ramda';
import logger from './middlewares/logger';
import session from './middlewares/session';
import flow from './middlewares/flow';
import auth from './middlewares/auth';
import read from '../sql/read-order';

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.use(logger);
bot.use(session);
bot.use(flow);
bot.use(auth);

if (process.env.NODE_ENV != 'production') {
  bot.command('/flow', ctx =>
    ctx.flow.enter(r.last(ctx.message.text.split(' '))));

  bot.command('/order', ctx =>
    read(r.last(ctx.message.text.split(' ')))
      .then(order => ctx.flow.enter('order.create', {order})));
}

bot.startPolling();

export default bot;
