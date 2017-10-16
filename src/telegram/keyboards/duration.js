import r from 'ramda';
import plural from '../../util/plural';
import cost, {format} from '../../util/cost';

const button = (duration, cost) => ({
  text: `${duration} ${plural(duration, 'час', 'часа', 'часов')} ${cost ? ` - ${format(cost)}` : ''}`,
  callback_data: `duration.${duration}`});

export default function(category, time) {
  return {
    reply_markup: {
      inline_keyboard: r.concat(
        r.splitEvery(1, r.map(
          d => button(d, cost(category, time, d)),
          [1, 2, 3, 4, 5, 12])),
        [[{text: '⬅ Назад', callback_data: 'cancel'}]])}};
}
