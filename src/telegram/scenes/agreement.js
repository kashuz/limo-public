import b from 'bluebird';
import { Scene } from 'telegraf-flow';
import { Extra as extra } from 'telegraf';
import translate from '../../translate';
import action from '../action';

const { reply, reset } = action('scene.agreement.message');
const scene = new Scene('agreement');

const keyboard = extra.markup(m =>
  m.inlineKeyboard([
    m.callbackButton('✅ I accept terms and conditions', 'agreement.yes'),
  ]),
);

scene.enter(ctx =>
  translate(ctx.user, 'agreement').then(text => reply(ctx, text, keyboard)),
);

scene.action('agreement.yes', ctx =>
  b
    .all([reset(ctx), ctx.reply('✅ Terms and conditions accepted')])
    .then(() => ctx.flow.enter('menu')),
);

scene.use((ctx, next) =>
  translate(ctx.user, 'agreement')
    .then(text => reply(ctx, text, keyboard))
    .then(next),
);

export default scene;
