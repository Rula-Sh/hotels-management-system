import { Employee } from './Employee.model';
import { Reservation } from './Reservation.model';
import { Room } from './Room.model';
import { Service } from './Service.model';

export interface Hotel {
  id: string;
  name: string;
  description: string;
  location: string;
  address: string;
  phone: string;
  email: string;

  starRating: 1 | 2 | 3 | 4 | 5;
  averageRating: number;

  createdAt: Date;
  updatedAt: Date;

  rooms?: Room[];
  employees?: Employee[];
  services?: Service[];
  reservations?: Reservation[];
}
