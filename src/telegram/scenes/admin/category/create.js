import r from 'ramda';
import b from 'bluebird';
import {Scene} from 'telegraf-flow';
import db from '../../../../db';
import {format} from '../../../../util/cost';
import outdent from 'outdent';

const scene = new Scene('admin.category.create');

scene.enter(ctx => ctx
  .reply(outdent`
      Название: <b>${ctx.flow.state.category.name}</b>
      Позиция: <b>${ctx.flow.state.category.position}</b>
      Минимальная цена: <b>${format(ctx.flow.state.category.min_price)}</b>
      1 дневной час: <b>${format(ctx.flow.state.category.day_hour_price)}</b>
      1 ночной час: <b>${format(ctx.flow.state.category.night_hour_price)}</b>
      5 часов: <b>${format(ctx.flow.state.category.five_hours_price)}</b>
      12 часов: <b>${format(ctx.flow.state.category.twelve_hours_price)}</b>`, {
    parse_mode: 'html',
    reply_markup: {
      inline_keyboard: [[
        {text: '❌ Отмена', callback_data: 'no'},
        {text: '💾 Сохранить', callback_data: 'yes'}]]}}));

scene.action('yes', ctx => db('category')
  .insert(ctx.flow.state.category)
  .returning('id')
  .then(r.head)
  .then(category => b.all([
    ctx.deleteMessage(),
    ctx.flow.enter('admin.category.view', {category})])));

scene.action('no', ctx => b.all([
  ctx.deleteMessage(),
  ctx.flow.enter('admin.category.index')]));

export default scene;
