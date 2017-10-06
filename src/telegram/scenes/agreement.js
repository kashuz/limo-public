import { Scene } from 'telegraf-flow';
import { Extra } from 'telegraf';
import translate from '../../translate';

const scene = new Scene('agreement');

scene.enter(ctx =>
  translate(ctx.user, 'agreement').then(text =>
    ctx.reply(
      text,
      Extra.markup(markup =>
        markup.inlineKeyboard([
          markup.callbackButton(
            '✅ I accept terms and conditions',
            'agreement.yes',
          ),
        ]),
      ),
    ),
  ),
);

scene.action('agreement.yes', ctx =>
  ctx
    .answerCallbackQuery('Thank you')
    .then(() =>
      ctx.editMessageReplyMarkup(
        Extra.markup(markup => markup.removeKeyboard()),
      ),
    )
    .then(() => ctx.flow.enter('menu')),
);

export default scene;
