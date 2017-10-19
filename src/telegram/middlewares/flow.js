import r from 'ramda';
import glob from 'glob';
import path from 'path';
import Flow from 'telegraf-flow';
import read from '../../sql/read-order';

const flow = new Flow(
  glob.sync(__dirname + '/../scenes/**/*.js').map(
    file => require(path.resolve(file)).default),
  {defaultScene: 'menu'});

if (process.env.NODE_ENV != 'production') {
  flow.command('menu', ctx =>
    ctx.flow.enter('menu'));

  flow.command('order', ctx =>
    r.last(ctx.message.text.split(' ')) &&
      read(r.last(ctx.message.text.split(' ')))
        .then(order => ctx.flow.enter('order.menu', {order})));
}

export default flow;
