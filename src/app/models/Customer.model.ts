import { RoomAppointment } from './RoomAppointment.model';
import { ServiceRequest } from './ServiceRequest.model';
import { User } from './User.model';

export interface Customer extends User {
  phone: number;
  address: string;
  roomAppontments: RoomAppointment[];
  serviceRequests: ServiceRequest[];
}
