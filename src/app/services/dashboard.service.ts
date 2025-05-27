import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getNumberOfUsers(): Observable<number[]> {
    return this.http.get<number[]>(`${this.baseUrl}/users`);
  }

  getNumberOfRooms(): Observable<number[]> {
    return this.http.get<number[]>(`${this.baseUrl}/rooms`);
  }

  getNumberOfReservations(): Observable<number[]> {
    return this.http.get<number[]>(`${this.baseUrl}/reservations`);
  }

  getNumberOfServices(): Observable<number[]> {
    return this.http.get<number[]>(`${this.baseUrl}/services`);
  }
}
