import { Room } from './Room.model';

export interface RoomAppointment extends Room {
  date: Date;
  customerId: string;
  appovalStatus: 'Pending' | 'Approved' | 'Rejected';
  paymentStatus: 'Paid' | 'Unpaid';
  paymentAmmount: number;
}
