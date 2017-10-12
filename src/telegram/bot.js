import Telegraf from 'telegraf';
import logger from './middlewares/logger';
import session from './middlewares/session';
import group from './middlewares/group';
import flow from './middlewares/flow';
import auth from './middlewares/auth';
import work from './worker';

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.use(logger);
bot.use(session);
bot.use(group);
bot.use(flow);
bot.use(auth);
bot.startPolling();

work(bot.telegram);

export default bot;
