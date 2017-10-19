import b from 'bluebird';
import {Scene} from 'telegraf-flow';
import translate, {photo} from '../../translate';
import botan from "../botan";

const extra = caption => ({
  caption,
  parse_mode: 'html',
  reply_markup: {
    inline_keyboard: [
      [{text: '⬅ Назад', callback_data: 'cancel'}]]}});

const scene = new Scene('plans');
const key = 'scene.plans.message';

scene.enter(botan('plans:enter',
  ctx => b.all([translate('plans'), photo('plans')])
    .then(([caption, photo]) => ctx.persistent.sendPhoto(key, photo, extra(caption)))));

scene.action('cancel', botan('plans:cancel',
  ctx => ctx.persistent.deleteMessage(key)
    .then(() => ctx.flow.enter('menu'))));

scene.use(botan('plans:default',
  (ctx, next) => ctx.persistent.deleteMessage(key)
    .then(() => b.all([translate('plans'),  photo('plans')]))
    .then(([caption, photo]) => ctx.persistent.sendPhoto(key, photo, extra(caption)))
    .then(() => next())));

export default scene;
