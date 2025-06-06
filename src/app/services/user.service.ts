import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../models/User.model';
import { Room } from '../models/Room.model';
import { Service } from '../models/Service.model';
import { Employee } from '../models/Employee.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor() {}
  api = inject(HttpClient);
  url = 'http://localhost:3000/users';
  roomsUrl = 'http://localhost:3000/rooms';
  servicesUrl = 'http://localhost:3000/services';

  getAllUsers(): Observable<User[]> {
    return this.api.get<User[]>(this.url);
  }

  getUserById(id: string): Observable<User> {
    return this.api.get<User>(`${this.url}/${id}`);
  }

  createUser(user: Omit<User, 'id'>): Observable<User> {
    return this.api.post<User>(this.url, user);
  }

  addEmployee(user: Omit<Employee, 'id'>): Observable<Employee> {
    return this.api.post<Employee>(this.url, user);
  }

  updateUserDetails(user: User): Observable<User> {
    return this.api.put<User>(`${this.url}/${user.id}`, user);
  }
}
