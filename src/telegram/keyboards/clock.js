import r from 'ramda';
import pad from 'left-pad';

const hour = r.pipe(r.split(':'), r.head, r.inc);

export default function(time) {
  const from = time ? hour(time) : 0;
  return {
    reply_markup: {
      inline_keyboard: r.concat(
        r.map(
          ([h1, h2]) => [
            { text: `${h1}:00`, callback_data: `time.${h1}:00` },
            h2
              ? { text: `${h2}:00`, callback_data: `time.${h2}:00` }
              : { text: '◦', callback_data: 'noop' },
          ],
          r.splitEvery(2, r.map(h => pad(h, 2, '0'), r.range(from, 24))),
        ),
        [[{ text: '⬅ Back', callback_data: 'cancel' }]],
      ),
    },
  };
}
