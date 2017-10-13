import patch from './patch';
import Telegraf from 'telegraf';
import logger from './middlewares/logger';
import limiter from './middlewares/rate-limiter';
import session from './middlewares/session';
import pm from './middlewares/persistent-message';
import group from './middlewares/group';
import flow from './middlewares/flow';
import auth from './middlewares/auth';
import worker from './worker';



const bot = new Telegraf(process.env.BOT_TOKEN);

bot.use((ctx, next) => {
  console.log(ctx.update);
  next();
});

bot.use(logger);

// if (!process.env.IGNORE) {
  bot.use(limiter);
  bot.use(session);
  bot.use(pm);
  bot.use(group);
  bot.use(flow);
  bot.use(auth);
// }

bot.startPolling();
worker(bot.telegram);
