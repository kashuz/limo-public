import Telegraf from 'telegraf';
import r from 'ramda';
import logger from './middlewares/logger';
import session from './middlewares/session';
import flow from './middlewares/flow';
import auth from './middlewares/auth';

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.use(logger);
bot.use(session);
bot.use(flow);
bot.use(auth);

bot.command('/flow', ctx => {
  ctx.flow.enter(r.last(ctx.message.text.split(' ')));
});

bot.startPolling();

export default bot;
