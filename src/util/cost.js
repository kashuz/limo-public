import r from 'ramda';

const hour = r.pipe(r.split(':'), r.head, r.inc);

export function format(value, fraction = 2, divider = '.', spacer = ' ') {
  let j, sign = value < 0 ? "-" : "",
    i = String(parseInt(value = Math.abs(Number(value) || 0).toFixed(fraction)));

  j = (j = i.length) > 3 ? j % 3 : 0;
  return sign + (j ? i.substr(0, j) + spacer : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + spacer) +
    (fraction ? divider + Math.abs(value - i).toFixed(fraction).slice(2) : "");
}

export default function(category, time, duration) {
  if (category === undefined) {
    return 0;
  }

  const dayStart = hour(process.env.DAY_START);
  const nightStart = hour(process.env.NIGHT_START);
  const start = hour(time);

  if (duration === 5) {
    return category.five_hours_price;
  } else if (duration === 12) {
    return category.twelve_hours_price;
  } else {
    let cost = category.min_price;
    for (let i = start + 1; i < start + duration; i++) {
      cost += (i >= dayStart && i < nightStart) ? category.day_hour_price : category.night_hour_price;
    }

    return cost;
  }
}