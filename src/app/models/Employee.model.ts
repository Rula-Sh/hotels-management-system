import { Service } from './Service.model';
import { ServiceRequest } from './ServiceRequest.model';
import { User } from './User.model';

// for runtime usage:
export const jobTitlesByCategory = {
  Housekeeping: ['Room Cleaner', 'Laundry Attendant'],
  Dining: ['Food & Beverage Server'],
  GuestServices: ['Valet Parking Attendant', 'Concierge', 'Porter'],
  Maintenance: [
    'Maintenance Technician',
    'Electrician',
    'Plumber',
    'IT Support Technician',
  ],
} as const;

// instead of declaring a type with the same const content
export type JobTitlesByCategory = {
  [K in keyof typeof jobTitlesByCategory]: (typeof jobTitlesByCategory)[K][number];
};
// typeof jobTitlesByCategory => This gets the type of the constant jobTitlesByCategory object... ex: Housekeeping: ['Room Cleaner', 'Laundry Attendant'],
// keyof typeof jobTitlesByCategory => This extracts the keys of the object as a union type... ex: 'Housekeeping' | 'Dining' | 'Guest Services' | 'Maintenance'
// [K in keyof typeof jobTitlesByCategory] => This is a mapped type that iterates over each key K in the keys above... It builds a new object type with the same keys.
// (typeof jobTitlesByCategory)[K][number] => gets the array type for key K, for ex: readonly ['Room Cleaner', 'Laundry Attendant']... Adding [number] indexes into the array type, extracting the union of all elements... So for Housekeeping it becomes 'Room Cleaner' | 'Laundry Attendant'.

export type JobCategory = keyof JobTitlesByCategory;

export type JobTitle = JobTitlesByCategory[JobCategory];

export interface Employee extends User {
  hotel: string;
  jobTitle: JobTitle;
  jobCategory: JobCategory;
  services?: Service[];
  serviceRequests?: ServiceRequest[];
}
