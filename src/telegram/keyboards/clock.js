import r from 'ramda';
import pad from 'left-pad';
import { Extra as extra } from 'telegraf';

const hour = r.pipe(r.split(':'), r.head, r.inc);

export default function(time) {
  const from = time ? hour(time) : 0;
  return extra.markup(m =>
    m.inlineKeyboard(
      r.concat(
        r.map(
          ([h1, h2]) => [
            m.callbackButton(`${h1}:00`, `time.${h1}:00`),
            h2
              ? m.callbackButton(`${h2}:00`, `time.${h2}:00`)
              : m.callbackButton('◦', 'noop'),
          ],
          r.splitEvery(2, r.map(h => pad(h, 2, '0'), r.range(from, 24))),
        ),
        [[m.callbackButton('⬅ Back', `cancel`)]],
      ),
    ),
  );
}
