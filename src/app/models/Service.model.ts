import { Employee } from './Employee.model';

export interface Service {
  id: string;
  employeeId: string;
  title: string;
  details: string;
  price: number;
  employee: Employee;
}
