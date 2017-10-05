import Telegraf from 'telegraf';
import logger from './middlewares/logger';
import session from './middlewares/session';
import flow from './middlewares/flow';

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.use(logger);
bot.use(session);
bot.use(flow);

bot.command('/oldschool', ctx => ctx.reply('Hello'));
bot.command('/modern', ctx => {
  ctx.flow.enter('register');
});
bot.command('/hipster', Telegraf.reply('λ'));

bot.startPolling();

export default bot;
