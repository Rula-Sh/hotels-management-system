import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';
import { Reservation } from '../../shared/models/Reservation.model';
import { Room } from '../../shared/models/Room.model';
import { User } from '../../shared/models/User.model';

@Injectable({
  providedIn: 'root',
})
export class ReservationService {
  constructor() {}
  api = inject(HttpClient);
  url = 'http://localhost:3000';

  getAllReservations(): Observable<Reservation[]> {
    // return this.api.get<Reservation[]>(`${this.url}/reservations?_expand=room&_expand=customer`)
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

  getReservationsByCustomerId(customerId: string): Observable<Reservation[]> {
    return this.api.get<Reservation[]>(
      `${this.url}/reservations/?customerId=${customerId}`
    );
  }

  approveReservationRequest(
    id: string,
    reservation: Reservation
  ): Observable<Reservation> {
    return this.api.put<Reservation>(
      `${this.url}/reservations/${id}`,
      reservation
    );
  }

  rejectReservationRequest(
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

  createReservation(
    reservation: Omit<Reservation, 'id'>
  ): Observable<Reservation> {
    return this.api.post<Reservation>(`${this.url}/reservations`, reservation);
  }
}
