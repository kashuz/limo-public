import r from 'ramda';

const hour = r.memoize(r.pipe(
  r.split(':'),
  r.head,
  r.inc));

export const format = r.memoize(r.pipe(
  r.toString(),
  r.split(''),
  r.reverse(),
  r.splitEvery(3),
  r.map(r.pipe(r.reverse(), r.join(''))),
  r.reverse(),
  r.join(' ')));

export default function(category, time, duration) {
  if (category && time && duration) {
    if (duration === 5)
      return category.five_hours_price;

    if (duration === 12)
      return category.twelve_hours_price;

    return r.reduce(
      (cost, hour) => cost + (
        h >= hour(process.env.DAY_START) && h < hour(process.env.NIGHT_START)
          ? category.day_hour_price
          : category.night_hour_price),
      category.min_price,
      r.range(hour(time) + 1, hour(time) + duration));
  }
}
