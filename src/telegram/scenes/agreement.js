import b from 'bluebird';
import {Scene} from 'telegraf-flow';
import translate from '../../translate';

const scene = new Scene('agreement');
const key = 'scene.agreement.message';

const extra = {
  reply_markup: {
    remove_keyboard: true,
    inline_keyboard: [[{
      text: 'Я согласен и принимаю условия limo.uz ',
      callback_data: 'agreement.yes'}]]}};

scene.enter(ctx =>
  translate('agreement')
    .then(text => ctx.persistent
      .sendMessage(key, text, extra)));

scene.action('agreement.yes', ctx => b
  .all([
    ctx.persistent.editMessageReplyMarkup(key, {}),
    ctx.answerCallbackQuery('Условия соглашения приняты')])
  .then(() => ctx.flow.enter('menu')));

scene.use((ctx, next) =>
  ctx.persistent.deleteMessage(key)
    .then(() => translate('agreement'))
    .then(text => ctx.persistent.sendMessage(key, text, extra))
    .then(() => next()));

export default scene;
