import m from 'moment';

m.locale('ru');

export function date(year, month, day) {
  return m({year, month: month - 1, day}).toDate();
}

export function format(date) {
  return m(date).format('LL');
}
