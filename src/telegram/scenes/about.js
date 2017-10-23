import {Scene} from 'telegraf-flow';
import translate from '../../translate';
import botan from "../botan";

const extra = {
  parse_mode: 'html',
  reply_markup: {
    inline_keyboard: [
      [{text: '⬅ Назад', callback_data: 'cancel'}]]}};

const scene = new Scene('about');
const key = 'scene.about.message';

scene.enter(botan('about:enter',
  ctx => translate('about')
    .then(text => ctx.persistent.sendMessage(key, text, extra))));

scene.action('cancel', botan('about:cancel',
  ctx => ctx.persistent.deleteMessage(key)
    .then(() => ctx.flow.enter('menu'))));

scene.use(botan('about:default',
  (ctx, next) => ctx.persistent.deleteMessage(key)
    .then(() => translate('about'))
    .then(text => ctx.persistent.sendMessage(key, text, extra))
    .then(() => next())));

export default scene;
