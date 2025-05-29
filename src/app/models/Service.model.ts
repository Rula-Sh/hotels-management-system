import { Employee } from './Employee.model';

export interface Service {
  id: string;
  employeeId: string;
  title: string;
  serviceType: 'Cleaning' | 'Dining' | 'Maintenance' | 'Health' | 'Beauty';
  details: string;
  price: number;
  imageUrl: string;
  employee: Employee;
}
