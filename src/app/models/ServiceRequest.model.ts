import { Customer } from './Customer.model';
import { Room } from './Room.model';
import { Service } from './Service.model';
import { User } from './User.model';

export interface ServiceRequest extends Service {
  id: string;
  date: Date;
  customerId: string;
  roomId: string;
  requestType: 'Cleaning' | 'Maintenance' | 'Repair';
  requestStatus: 'Pending' | 'In Progress' | 'Completed' | 'Rejected';
  notes:string,
  customer: User;
  room: Room;
}
