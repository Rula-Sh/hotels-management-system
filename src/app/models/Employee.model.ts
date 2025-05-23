import { Service } from './Service.model';
import { ServiceRequest } from './ServiceRequest.model';
import { User } from './User.model';

export interface Employee extends User {
  jobTitle: string;
  services?: Service[];
  serviceRequests?: ServiceRequest[];
}
