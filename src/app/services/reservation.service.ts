import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';
import { Reservation } from '../models/Reservation.model';
import { Room } from '../models/Room.model';
import { User } from '../models/User.model';

@Injectable({
  providedIn: 'root',
})
export class ReservationService {
  constructor() {}
  api = inject(HttpClient);
  url = 'http://localhost:3000';

  getAllReservations(): Observable<Reservation[]> {
    return forkJoin({
      reservations: this.api.get<any[]>(`${this.url}/reservations`),
      rooms: this.api.get<Room[]>(`${this.url}/rooms`),
      users: this.api.get<User[]>(`${this.url}/users`),
    }).pipe(
      map(({ reservations, rooms, users }) =>
        reservations.map((r) => ({
          ...r,
          room: rooms.find((room) => room.id === r.roomId),
          customer: users.find((user) => user.id === r.customerId),
        }))
      )
    );
  }

  getReservationById(id: string): Observable<Reservation> {
    return this.api.get<Reservation>(`${this.url}/reservations/${id}`);
  }

  ApproveReservationRequest(
    id: string,
    reservation: Reservation
  ): Observable<Reservation> {
    return this.api.put<Reservation>(
      `${this.url}/reservations/${id}`,
      reservation
    );
  }

  RejectReservationRequest(
    id: string,
    reservation: Reservation
  ): Observable<Reservation> {
    return this.api.put<Reservation>(
      `${this.url}/reservations/${id}`,
      reservation
    );
  }

  cancelReservation(id: string): Observable<void> {
    return this.api.delete<void>(`${this.url}/reservations/${id}`);
  }
}
