import r from 'ramda';
import plural from '../../util/plural';
import cost, {format} from '../../util/cost';

function button(duration, cost) {
  return {
    text: `${duration} ${plural(duration, 'час', 'часа', 'часов')} ${format(cost) ? ` - ${format(cost)} сум` : ''}`,
    callback_data: `duration.${duration}`}
}

export default function(category, time) {
  return {
    reply_markup: {
      inline_keyboard: r.concat(
        r.map(
          ([d1, d2]) => [
            button(d1, cost(category, time, d1)),
            button(d2, cost(category, time, d2))],
          r.splitEvery(2, [1, 2, 3, 4, 5, 12])),
        [[{text: '⬅ Назад', callback_data: 'cancel'}]])}};
}
