import {Scene} from 'telegraf-flow';
import translate from '../../translate';
import action from '../action';

const {reply, reset} = action('scene.plans.message');

const extra = {
  parse_mode: 'html',
  reply_markup: {
    inline_keyboard: [
      [{text: '⬅ Назад', callback_data: 'cancel'}]]}};

const scene = new Scene('plans');

scene.enter(ctx =>
  translate('plans')
    .then(text => reply(ctx, text, extra)));

scene.action('cancel', ctx =>
  reset(ctx).then(() => ctx.flow.enter('menu')));

scene.use(ctx =>
  translate('plans')
    .then(text => reply(ctx, text, extra))
    .then(() => next()));

export default scene;
