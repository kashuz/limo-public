import TelegrafFlow from 'telegraf-flow';
import register from '../scenes/register';
import menu from '../scenes/menu';
import agreement from '../scenes/agreement';
import plans from '../scenes/plans';
import orderCreate from '../scenes/order/create';
import orderLocation from '../scenes/order/location';

const flow = new TelegrafFlow();
flow.register(menu);
flow.register(register);
flow.register(agreement);
flow.register(plans);
flow.register(orderCreate);
flow.register(orderLocation);

export default flow;
