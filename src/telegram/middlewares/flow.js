import TelegrafFlow from 'telegraf-flow';
import register from '../scenes/register';
import menu from '../scenes/menu';
import agreement from '../scenes/agreement';
import plans from '../scenes/plans';

const flow = new TelegrafFlow();
flow.register(menu);
flow.register(register);
flow.register(agreement);
flow.register(plans);

export default flow;
