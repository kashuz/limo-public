import r from 'ramda';
import cost, {format} from '../../util/cost';

export default function (categories, cars, category, position, prev, next, time, duration) {
  const c = cost(r.find(r.propEq('id', category), categories), time, duration);
  return {
    caption: r.join('\n', [
      `${cars[position].name} ${c ? `- ${format(c)} сум` : ''} (${position + 1} из ${cars.length})`,
      `${cars[position].link}`]),
    reply_markup: {
      inline_keyboard: [
        [{text: '◀️', callback_data: `skip.${category}.${cars[prev].id}`},
          {text: 'Выбрать', callback_data: `select.${category}.${cars[position].id}`},
          {text: '▶️', callback_data: `skip.${category}.${cars[next].id}`}],
        [{text: '🎲 Любой', callback_data: `random.${category}`}],
        categories.map(c => ({
          text: (category === c.id ? '◼️ ' : '◻️ ') + c.name,
          callback_data: `category.${c.id}`})),
        [{text: '⬅ Назад', callback_data: `cancel`}]]}};
}
