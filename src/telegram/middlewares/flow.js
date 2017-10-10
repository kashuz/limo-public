import glob from 'glob';
import path from 'path';
import Flow from 'telegraf-flow';

const flow = new Flow();

glob.sync(__dirname + '/../scenes/**/*.js').forEach(
  file => flow.register(
    require(path.resolve(file)).default));

export default flow;
