import { Service } from './Service.model';
import { ServiceRequest } from './ServiceRequest.model';
import { User } from './User.model';

type JobCategory = 'Housekeeping' | 'Food & Beverage' | 'Guest Services' | 'Maintenance';

export type JobTitle =
  // Housekeeping
  | 'Room Cleaner'
  | 'Laundry Attendant'

  // Dining
  | 'Food & Beverage Server'

  // Guest Services / Requests
  | 'Valet Parking Attendant'
  | 'Concierge'
  | 'Porter'

  // Maintenance
  | 'Maintenance Technician'
  | 'Electrician'
  | 'Plumber'
  | 'IT Support Technician';

export interface Employee extends User {
  hotel: string;
  jobTitle: JobTitle;
  jobCategory: JobCategory;
  services?: Service[];
  serviceRequests?: ServiceRequest[];
}
