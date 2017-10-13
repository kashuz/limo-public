import r from 'ramda';
import m from 'moment';
import {Calendar, MONDAY} from 'node-calendar';

m.locale('ru');

function moment(year, month, day) {
  return m({year, month: month - 1, day});
}

export function calendar([year, month]) {
  return r.map(
    r.map(day => day && !moment(year, month, day).isBefore(m()) ? day : 0),
    new Calendar(MONDAY).monthdayscalendar(year, month));
}

export function neighbours([year, month]) {
  const prev = moment(year, month).subtract(1, 'months');
  const next = moment(year, month).add(1, 'months');

  return {
    prev: prev.date(2).isBefore(m().date(1))
            ? undefined
            : [prev.year(), prev.month() + 1],
    next: [next.year(), next.month() + 1]};
}

export function init(date) {
  const moment = date ? m(date) : m();
  return [moment.year(), moment.month() + 1];
}

export function format([year, month]) {
  return moment(year, month).format('MMMM YYYY');
}
