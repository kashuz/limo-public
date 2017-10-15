import './patch';
import Telegraf from 'telegraf';
import logger from './middlewares/logger';
import limiter from './middlewares/rate-limiter';
import session from './middlewares/session';
import persistent from './middlewares/persistent';
import util from './middlewares/util';
import group from './middlewares/group';
import flow from './middlewares/flow';
import worker from './worker';

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.use(logger);
bot.use(limiter);
bot.use(session);
bot.use(persistent);
bot.use(util);
bot.use(group);
bot.use(flow);

bot.startPolling();
worker(bot.telegram);
