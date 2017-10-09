import r from 'ramda';
import m from 'moment';
import { Calendar, MONDAY } from 'node-calendar';

export function calendar([year, month]) {
  return r.map(
    r.map(
      day =>
        day && !m({ year, month: month - 1, day }).isBefore(m()) ? day : 0,
    ),
    new Calendar(MONDAY).monthdayscalendar(year, month),
  );
}

export function neighbours([year, month]) {
  const prev = m({ year, month: month - 1 }).subtract(1, 'months');
  const next = m({ year, month: month - 1 }).add(1, 'months');
  return {
    prev: prev.date(2).isBefore(m().date(1))
      ? undefined
      : [prev.year(), prev.month() + 1],
    next: [next.year(), next.month() + 1],
  };
}

export function init(date) {
  return [m(date || undefined).year(), m(date || undefined).month() + 1];
}

export function format([year, month]) {
  return m({ year, month: month - 1 }).format('MMMM YYYY');
}
