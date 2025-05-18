import { Customer } from './Customer';
import { Employee } from './Employee';
import { Room } from './Room';
import { Service } from './Service';
import { User } from './User';

export interface Admin extends User {
  employees: Employee[];
  customers: Customer[];
  rooms: Room[];
  services: Service[];
}
