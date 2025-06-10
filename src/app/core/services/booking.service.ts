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

  updateBookingStatus(
    userId: string,
    roomId: string,
    status: string
  ): Observable<any> {
getBookingByUserAndRoom(customerId: string, roomId: string): Observable<any> {
  return this.http.get<any[]>(`${this.apiUrl}/reservations?customerId=${customerId}&roomId=${roomId}`).pipe(
    map(bookings => bookings[0]) // لأن json-server يرجع array
  );
}



  updateBookingStatus(userId: string, roomId: string, status: string): Observable<any> {
    return this.getBookingByUserAndRoom(userId, roomId).pipe(
      map((reservation) => {
        if (!reservation) throw new Error('Reservation not found');
        return reservation;
      }),
      switchMap((reservation: Reservation) =>
        this.http.patch(`${this.reservationsUrl}/${reservation.id}`, {
          paymentStatus: status,
        })
        this.http.patch(`${this.apiUrl}/reservations/${reservation.id}`, { status })
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

  getApprovedServicesByCustomerAndRoom(
    customerId: string,
    roomId: string
  ): Observable<any[]> {
    const url = `${this.apiUrl}/serviceRequests?customerId=${customerId}&roomId=${roomId}&requestStatus=Completed`;
    return this.http.get<any[]>(url);
  }
  getApprovedServicesByCustomerAndRoom(customerId: string, roomId: string): Observable<any[]> {
  const url = `${this.apiUrl}/serviceRequests?customerId=${customerId}&roomId=${roomId}&requestStatus=Approved`;
  return this.http.get<any[]>(url);
}
updateReservation(reservationId: number, updatedData: any): Observable<any> {
  return this.http.put(`${this.apiUrl}/reservations/${reservationId}`, updatedData);
}


}
