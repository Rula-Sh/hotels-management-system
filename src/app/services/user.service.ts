import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../models/User.model';
import { Room } from '../models/Room.model';
import { Service } from '../models/Service.model';

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

  CreateUser(user: Omit<User, 'id'>): Observable<User> {
    return this.api.post<User>(this.url, user);
  }

  UpdateUserDetails(user: User): Observable<User> {
    return this.api.put<User>(`${this.url}/${user.id}`, user);
  }

  BookARoom(room: Room): Observable<Room> {
    return this.api.post<Room>(`${this.roomsUrl}/${room.id}`, room);
  }

  requestAService(service: Service): Observable<Service> {
    return this.api.post<Service>(`${this.roomsUrl}/${service.id}`, service);
  }
}
