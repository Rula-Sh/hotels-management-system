import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, switchMap } from 'rxjs';
import { Reservation } from '../../shared/models/Reservation.model';

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private reservationsUrl = 'http://localhost:3000/reservations'; // حسب الـ json-server عندك
  private roomsUrl = 'http://localhost:3000/rooms';
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getBookingByUserAndRoom(userId: string, roomId: string): Observable<any> {
    return this.http
      .get<any[]>(
        `${this.reservationsUrl}?customerId=${userId}&roomId=${roomId}`
      )
      .pipe(
        map((reservations) =>
          reservations.length > 0 ? reservations[0] : null
        )
      );
  }

  updateReservationAndRoom(
    reservationId: string,
    roomId: string,
    reservationUpdates: any,
    roomUpdates: any
  ): Observable<any> {
    const updateReservation$ = this.http.patch(
      `${this.reservationsUrl}/${reservationId}`,
      reservationUpdates
    );
    const updateRoom$ = this.http.patch(
      `${this.roomsUrl}/${roomId}`,
      roomUpdates
    );

    return forkJoin([updateReservation$, updateRoom$]);
  }

  getApprovedAndInProgressServicesByCustomerAndRoom(
    customerId: string,
    roomId: string
  ): Observable<any[]> {
    const url = `${this.apiUrl}/serviceRequests?customerId=${customerId}&roomId=${roomId}&requestStatus=Completed&requestStatus=In%20Progress`;
    return this.http.get<any[]>(url);
  }
}
