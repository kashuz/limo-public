import m from 'moment';

export function date(year, month, day) {
  return m({ year, month: month - 1, day }).toDate();
}

// eslint-disable-next-line no-shadow
export function format(date) {
  return m(date).format('LL');
}
