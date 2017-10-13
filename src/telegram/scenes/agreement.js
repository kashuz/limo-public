import b from 'bluebird';
import {Scene} from 'telegraf-flow';
import translate from '../../translate';
import action from '../action';

const {reply, reset} = action('scene.agreement.message');
const scene = new Scene('agreement');

const extra = {
  reply_markup: {
    remove_keyboard: true,
    inline_keyboard: [[{
      text: 'Я согласен и принимаю условия limo.uz ',
      callback_data: 'agreement.yes'}]]}};

scene.enter(ctx =>
  translate('agreement')
    .then(text => reply(ctx, text, extra)));

scene.action('agreement.yes', ctx => b
  .all([
    reset(ctx),
    ctx.answerCallbackQuery('Условия соглашения приняты')])
  .then(() => ctx.flow.enter('menu')));

scene.use((ctx, next) =>
  translate('agreement')
    .then(text => reply(ctx, text, extra))
    .then(() => next()));

export default scene;
