import { Service } from './Service';
import { ServiceRequest } from './ServiceRequest';
import { User } from './User';

export interface Employee extends User {
  job: string;
  services: Service[];
  serviceRequests: ServiceRequest[];
}
