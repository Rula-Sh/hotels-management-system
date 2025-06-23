import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../../shared/models/User.model';
import { Employee } from '../../shared/models/Employee.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor() {}
  api = inject(HttpClient);
  url = 'http://localhost:3000/users';

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
  
  updateEmployee(user: Employee): Observable<Employee> {
    return this.api.put<Employee>(`${this.url}/${user.id}`, user);
  }
  
 updatePhone(userId: string, phone: string): Observable<User> {
    return this.api.patch<User>(`${this.url}/${userId}`, { phone });
  }
}
