import r from 'ramda';
import {format} from '../../util/cost';
import concat from '../../util/concat';

function footer(categories, category) {
  return concat([
    r.splitEvery(2, r.map(
      c => ({text: (category === c.id ? '◼️ ' : '◻️ ') + c.name, callback_data: `category.${c.id}`}),
      categories)),
    [[{text: '⬅ Назад', callback_data: `cancel`}]]]);
}

export function initial(categories) {
  return {
    reply_markup: {
      inline_keyboard: footer(categories)}};
}

export function full(categories, cars, category, index, prev, next, cost) {
  return {
    caption: r.join('\n', [
      `${cars[index].name} ${cost ? `- ${format(cost)}` : ''} (${index + 1} из ${cars.length})`,
      `${cars[index].link}`]),
    reply_markup: {
      inline_keyboard: concat([
        [[{text: '◀️', callback_data: `skip.${category}.${cars[prev].id}`},
          {text: 'Выбрать', callback_data: `select.${category}.${cars[index].id}`},
          {text: '▶️', callback_data: `skip.${category}.${cars[next].id}`}],
         [{text: '🎲 Любой', callback_data: `random.${category}`}]],
        footer(categories, category)])}};
}
