import TelegrafFlow from 'telegraf-flow';
import register from '../scenes/register';

const flow = new TelegrafFlow();
flow.register(register);

export default flow;
