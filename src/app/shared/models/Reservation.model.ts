import { Room } from './Room.model';
import { User } from './User.model';

export interface Reservation {
  id: string;
  roomId: string;
  date: Date;
  customerId: string;
  approvalStatus: 'Pending' | 'Approved' | 'Rejected';
  paymentStatus: 'Paid' | 'Unpaid';
  paymentAmount: number;
  room: Room;
  customer: User;
  isCheckedOut: boolean;
  checkInDate: Date;
  checkOutDate: Date;
}
