import { Service } from './Service.model';

export interface ServiceRequest extends Service {
  id: string;
  date: Date;
  customerId: string;
  employeeId: string;
  requestType: 'Cleaning' | 'Maintenance' | 'Repair';
  requestStatus: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
}
