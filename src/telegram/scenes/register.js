import { Scene } from 'telegraf-flow';

const scene = new Scene('register');

scene.enter(ctx => {
  ctx.reply('Register scene entered');
});

scene.on('text', ctx => {
  ctx.reply('Redirecting to next scene');
  ctx.flow.enter('menu');
});

export default scene;
