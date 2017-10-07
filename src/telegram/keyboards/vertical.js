import r from 'ramda';
import { Extra as extra } from 'telegraf';

export default function(items) {
  return extra.markup(m =>
    m.inlineKeyboard(
      r.map(
        ([label, action]) => m.callbackButton(label, action),
        r.toPairs(items),
      ),
      { columns: 1 },
    ),
  );
}
