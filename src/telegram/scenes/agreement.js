import b from 'bluebird';
import {Scene} from 'telegraf-flow';
import translate from '../../translate';
import action from '../action';

const {reply, reset} = action('scene.agreement.message');
const scene = new Scene('agreement');

const extra = {
  reply_markup: {
    inline_keyboard: [[{
      text: 'I accept terms and conditions',
      callback_data: 'agreement.yes'}]]}};

scene.enter(ctx =>
  translate('agreement')
    .then(text => reply(ctx, text, extra)));

scene.action('agreement.yes', ctx => b
  .all([
    reset(ctx),
    ctx.answerCallbackQuery('Terms and conditions accepted')])
  .then(() => ctx.flow.enter('menu')));

scene.use((ctx, next) =>
  translate('agreement')
    .then(text => reply(ctx, text, extra))
    .then(() => next()));

export default scene;
