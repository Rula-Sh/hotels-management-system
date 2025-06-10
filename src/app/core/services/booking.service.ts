import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map,switchMap } from 'rxjs';
import { Reservation } from '../../shared/models/Reservation.model';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = 'http://localhost:3000'; 

  constructor(private http: HttpClient) {}

getBookingByUserAndRoom(customerId: string, roomId: string): Observable<any> {
  return this.http.get<any[]>(`${this.apiUrl}/reservations?customerId=${customerId}&roomId=${roomId}`).pipe(
    map(bookings => bookings[0]) // لأن json-server يرجع array
  );
}



  updateBookingStatus(userId: string, roomId: string, status: string): Observable<any> {
    return this.getBookingByUserAndRoom(userId, roomId).pipe(
      map(reservation => {
        if (!reservation) throw new Error('Reservation not found');
        return reservation;
      }),
      switchMap((reservation: Reservation) =>
        this.http.patch(`${this.apiUrl}/reservations/${reservation.id}`, { status })
      )
    );
  }
  getApprovedServicesByCustomerAndRoom(customerId: string, roomId: string): Observable<any[]> {
  const url = `${this.apiUrl}/serviceRequests?customerId=${customerId}&roomId=${roomId}&requestStatus=Approved`;
  return this.http.get<any[]>(url);
}
updateReservation(reservationId: number, updatedData: any): Observable<any> {
  return this.http.put(`${this.apiUrl}/reservations/${reservationId}`, updatedData);
}


}
