import { RoomAppointment } from "./RoomAppointment";
import { ServiceRequest } from "./ServiceRequest";
import { User } from "./User";

export interface Customer extends User{
    phone: number;
    address: string;
    roomAppontments: RoomAppointment[];
    serviceRequests: ServiceRequest[];
}
