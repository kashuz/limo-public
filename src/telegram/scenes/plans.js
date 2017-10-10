import {Scene} from 'telegraf-flow';
import translate from '../../translate';
import delay from '../../util/delay';

const scene = new Scene('plans');

scene.enter(ctx =>
  translate(ctx.user, 'plans')
    .then(text => ctx.reply(text))
    .then(delay(1000))
    .then(() => ctx.flow.enter('menu')));

export default scene;
