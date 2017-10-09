import TelegrafFlow from 'telegraf-flow';
import register from '../scenes/register';
import menu from '../scenes/menu';
import agreement from '../scenes/agreement';
import plans from '../scenes/plans';
import orderCreate from '../scenes/order/create';
import orderLocation from '../scenes/order/location';
import orderDate from '../scenes/order/date';
import orderStartTime from '../scenes/order/start-time';
import orderFinishTime from '../scenes/order/finish-time';
import orderNote from '../scenes/order/note';

const flow = new TelegrafFlow();
flow.register(menu);
flow.register(register);
flow.register(agreement);
flow.register(plans);
flow.register(orderCreate);
flow.register(orderLocation);
flow.register(orderDate);
flow.register(orderStartTime);
flow.register(orderFinishTime);
flow.register(orderNote);

export default flow;
