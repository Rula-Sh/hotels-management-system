import { Employee, JobTitle } from './Employee.model';

export const serviceTypesByJobTitle: Record<JobTitle, ServiceType[]> = {
  'Room Cleaner': ['Cleaning'],
  'Laundry Attendant': ['Cleaning'],
  'Food & Beverage Server': ['Dining'],
  'Valet Parking Attendant': ['GuestServices'],
  Concierge: ['GuestServices'],
  Porter: ['GuestServices'],
  'Maintenance Technician': ['Maintenance'],
  Electrician: ['Maintenance'],
  Plumber: ['Maintenance'],
  'IT Support Technician': ['Maintenance'],
  'Massage Therapist': ['Health', 'Beauty'],
  'Hair Stylist': ['Beauty'],
  'Personal Trainer': ['Health'],
};

export type ServiceType =
  | 'Cleaning'
  | 'Dining'
  | 'GuestServices'
  | 'Maintenance'
  | 'Health'
  | 'Beauty';

export interface Service {
  id: string;
  employeeId: string;
  title: string;
  serviceType: ServiceType;
  details: string;
  price: number;
  imageUrl: string;
  employee: Employee;
}
