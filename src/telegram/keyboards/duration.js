import r from 'ramda';
import plural from '../../util/plural';
import cost from '../../util/cost';
import compact from '../../util/compact';

function key(category, time, duration) {
  console.log(`duration.${duration}:${cost(category, time, duration)}`);
  return {
    text: `${duration} ${plural(duration, 'час', 'часа', 'часов')}`,
    callback_data: `duration.${duration}:${cost(category, time, duration)}`
  }
}

export default function(category, time) {
  return {
    reply_markup: {
      inline_keyboard: r.concat(
        r.map(
          ([d1, d2]) => compact([key(category, time, d1), d2 && key(category, time, d2)]),
          r.splitEvery(2, r.concat(r.range(1, 6), [12]))),
        [[{text: '⬅ Назад', callback_data: 'cancel'}]])}};
}
