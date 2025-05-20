import { Room } from './Room.model';
import { User } from './User.model';

export interface Reservation {
  id: string;
  roomId: string;
  date: Date;
  customerId: string;
  appovalStatus: 'Pending' | 'Approved' | 'Rejected';
  paymentStatus: 'Paid' | 'Unpaid';
  paymentAmmount: number;
  room: Room;
  customer: User;
}
