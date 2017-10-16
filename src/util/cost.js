import r from 'ramda';

const hour = r.memoize(r.pipe(
  r.split(':'),
  r.head,
  r.inc));

const formatter = new Intl.NumberFormat('ru-RU', {
  style: 'decimal',
  minimumFractionDigits: 0});

export function format(value) {
  return formatter.format(value) + ' сум';
}

export default function(category, time, duration) {
  if (category && time && duration) {
    if (duration === 5)
      return category.five_hours_price;

    if (duration === 12)
      return category.twelve_hours_price;

    return r.reduce(
      (cost, h) => cost + (
        h >= hour(process.env.DAY_START) && h < hour(process.env.NIGHT_START)
          ? category.day_hour_price
          : category.night_hour_price),
      category.min_price,
      r.range(hour(time) + 1, hour(time) + duration));
  }
}
