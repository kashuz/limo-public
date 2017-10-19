
module.exports.up = async (db) => {
  const Telegram = require('telegraf').Telegram;
  const telegram = new Telegram(process.env.BOT_TOKEN);

  await db('user')
    .where(db.raw(`coalesce(session #>> '{"_flow", "id"}', 'register') = ?`, 'register'))
    .map(async user => {
      try {
        await telegram.deleteMessage(user.id, user.session['scene.register.message']);
      } catch(e) {

      }

      const {message_id} = await telegram.sendMessage(
        user.id,
        'Меню',
        {reply_markup: {
          inline_keyboard: [
            [{text: '🚘 Сделать заказ', callback_data: 'order'}],
            [{text: '🏷 Тарифы', callback_data: 'plans'}]]}});

      await db('user').where('id', user.id).update({session: {
        "_flow": {
          "id": "menu",
          "_state": {}},
        "scene.menu.message": message_id}});
    });

  await db('user')
    .where(db.raw(`session #>> '{"_flow", "id"}' = ?`, 'agreement'))
    .map(async user => {
      try {
        await telegram.deleteMessage(user.id, user.session['scene.register.message']);
        await telegram.deleteMessage(user.id, user.session['scene.agreement.message']);
      } catch(e) {

      }

      const {message_id} = await telegram.sendMessage(
        user.id,
        'Меню',
        {reply_markup: {
          inline_keyboard: [
            [{text: '🚘 Сделать заказ', callback_data: 'order'}],
            [{text: '🏷 Тарифы', callback_data: 'plans'}]]}});

      await db('user').where('id', user.id).update({session: {
        "_flow": {
          "id": "menu",
          "_state": {}},
        "scene.menu.message": message_id}});

      console.info(`User ${user.id} moved from agreement scene`);
    });
};

module.exports.down = async (db) => {
  
};

module.exports.configuration = { transaction: true };
