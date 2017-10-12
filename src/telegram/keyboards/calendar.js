import r from 'ramda';
import {calendar, format, neighbours} from '../../util/calendar';
import concat from '../../util/concat';

export default function(pair) {
  const {prev, next} = neighbours(pair);

  return {
    reply_markup: {
      inline_keyboard: concat([
        [[prev ? {text: '◀️', callback_data: `month.${prev[0]}.${prev[1]}`}
               : {text: '◦', callback_data: 'noop'},
          {text: format(pair), callback_data: 'noop'},
          {text: '▶️', callback_data: `month.${next[0]}.${next[1]}`}]],
        calendar(pair).map(r.map(day => day
          ? {text: `${day}`,
             callback_data: `day.${pair[0]}.${pair[1]}.${day}`}
          : {text: '◦', callback_data: 'noop'})),
        [[{text: '⬅ Back', callback_data: 'cancel'}]]])}};
}
