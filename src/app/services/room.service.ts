import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Room } from '../models/Room.model';

@Injectable({
  providedIn: 'root',
})
export class RoomService {
  constructor() {}
  api = inject(HttpClient);
  url = 'http://localhost:3000/rooms';

  getAllRooms(): Observable<Room[]> {
    return this.api.get<Room[]>(this.url);
  }

  getRoomById(id: string): Observable<Room> {
    return this.api.get<Room>(`${this.url}/${id}`);
  }

  CreateRoom(rooms: Omit<Room, 'id'>): Observable<Room> {
    return this.api.post<Room>(this.url, rooms);
  }

  updateRoom(id: string, room: Room): Observable<Room> {
    return this.api.put<Room>(`${this.url}/${id}`, room);
  }

  RemoveRoom(id: string): Observable<void> {
    return this.api.delete<void>(`${this.url}/${id}`);
  }
}
