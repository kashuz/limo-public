import r from 'ramda';
import {calendar, format, neighbours} from '../../util/calendar';
import concat from '../../util/concat';

export default function(pair) {
  const {prev, next} = neighbours(pair);

  return {
    reply_markup: {
      inline_keyboard: concat([
        [[prev ? {text: '◀️', callback_data: `month.${prev[0]}.${prev[1]}`}
               : {text: 'ᐧ', callback_data: 'noop'},
          {text: format(pair), callback_data: 'noop'},
          {text: '▶️', callback_data: `month.${next[0]}.${next[1]}`}]],
        [[{text: 'пн', callback_data: 'noop'},
          {text: 'вт', callback_data: 'noop'},
          {text: 'ср', callback_data: 'noop'},
          {text: 'чт', callback_data: 'noop'},
          {text: 'пт', callback_data: 'noop'},
          {text: 'сб', callback_data: 'noop'},
          {text: 'вс', callback_data: 'noop'}]],
        calendar(pair).map(r.map(day => day
          ? {text: `${day}`,
             callback_data: `day.${pair[0]}.${pair[1]}.${day}`}
          : {text: 'ᐧ', callback_data: 'noop'})),
        [[{text: '⬅ Назад', callback_data: 'cancel'}]]])}};
}
