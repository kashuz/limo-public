import {Scene} from 'telegraf-flow';
import translate from '../../translate';

const extra = {
  parse_mode: 'html',
  reply_markup: {
    inline_keyboard: [
      [{text: '⬅ Назад', callback_data: 'cancel'}]]}};

const scene = new Scene('plans');
const key = 'scene.plans.message';

scene.enter(ctx => translate('plans')
  .then(text => ctx.persistent.sendMessage(key, text, extra)));

scene.action('cancel', ctx =>
  ctx.persistent.deleteMessage(key)
    .then(() => ctx.flow.enter('menu')));

scene.use((ctx, next) =>
  ctx.persistent.deleteMessage(key)
    .then(() => translate('plans'))
    .then(text => ctx.persistent.sendMessage(key, text, extra))
    .then(() => next()));

export default scene;
