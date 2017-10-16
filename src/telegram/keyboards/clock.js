import r from 'ramda';
import pad from 'left-pad';

const buttons = r.pipe(
  r.map(h => pad(h, 2, '0')),
  r.map(h => ({text: `${h}:00`, callback_data: `time.${h}:00`})),
  r.splitEvery(3));

const clock = {
  reply_markup: {
    inline_keyboard: r.concat(
      buttons(r.range(0, 24)),
      [[{text: '⬅ Назад', callback_data: 'cancel'}]])}};

export default clock;
