import b from 'bluebird';
import {Scene} from 'telegraf-flow';
import db from '../../../../db';

const scene = new Scene('admin.category.delete');

scene.enter(ctx =>
  db('order').where('category_id', ctx.flow.state.category).count().then(
    ({count}) => ctx
      .reply(`${count ? `Существует ${count} заказов c этим классом. ` : ''} Вы точно хотите удалить этот класс?`, {
        reply_markup: {
          inline_keyboard: [
            [{text: '⬅ Отмена', callback_data: 'no'},
             {text: '🚮 Удалить', callback_data: 'yes'}]]}})));

scene.action('yes', ctx => db('category')
  .where('id', ctx.flow.state.category)
  .delete()
  .then(() => b.all([
    ctx.deleteMessage(),
    ctx.flow.enter('admin.category.index')])));

scene.action('no', ctx => b.all([
  ctx.deleteMessage(),
  ctx.flow.enter('admin.category.view', {
    category: ctx.flow.state.category})]));

export default scene;
