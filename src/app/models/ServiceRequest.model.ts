import { Room } from './Room.model';
import { User } from './User.model';

export interface ServiceRequest {
  id: string;
  date: Date;
  customerId: string;
  roomId: string;
  requestStatus: 'Pending' | 'In Progress' | 'Completed' | 'Canceled';
  notes: string;
  customer: User;
  room: Room;
  employeeId: string;
  employee: User;
  // خصائص الخدمة:
  title: string;
  serviceType: string;
  details: string;
  price: number;
  imageUrl: string;
}
