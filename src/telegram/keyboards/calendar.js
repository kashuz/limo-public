import r from 'ramda';
import { Extra as extra } from 'telegraf';
import { calendar, format, neighbours } from '../../util/calendar';

const concat = r.reduce(r.concat, []);

export default function(pair) {
  const { prev, next } = neighbours(pair);

  return extra.markup(m =>
    m.inlineKeyboard(
      concat([
        [
          [
            prev
              ? m.callbackButton('◀️', `month.${prev[0]}.${prev[1]}`)
              : m.callbackButton('◦', 'noop'),
            m.callbackButton(format(pair), 'noop'),
            m.callbackButton('▶️', `month.${next[0]}.${next[1]}`),
          ],
        ],
        calendar(pair).map(
          r.map(
            day =>
              day
                ? m.callbackButton(`${day}`, `day.${pair[0]}.${pair[1]}.${day}`)
                : m.callbackButton('◦', `noop`),
          ),
        ),
        [[m.callbackButton('⬅ Back', `cancel`)]],
      ]),
    ),
  );
}
