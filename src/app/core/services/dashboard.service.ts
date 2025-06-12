import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Reservation } from '../../shared/models/Reservation.model';
import { ServiceRequest } from '../../shared/models/ServiceRequest.model';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getTotalEmployees(): Observable<number> {
    return this.http
      .get<any[]>(`${this.baseUrl}/users`)
      .pipe(
        map((users) => users.filter((user) => user.role === 'Employee').length)
      );
  }

  getTotalCustomers(): Observable<number> {
    return this.http
      .get<any[]>(`${this.baseUrl}/users`)
      .pipe(
        map((users) => users.filter((user) => user.role === 'Customer').length)
      );
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

  getNumberOfServicesRequests(): Observable<number[]> {
    return this.http.get<number[]>(`${this.baseUrl}/serviceRequests`);
  }

  getAvgReservationsPerDay(): Observable<number> {
    return this.http.get<Reservation[]>(`${this.baseUrl}/reservations`).pipe(
      map((reservations) => {
        if (reservations.length === 0) return 0;

        // create a map to group counts by date (formatted as yyyy-mm-dd string)
        const countsByDate = new Map<string, number>();

        reservations.forEach((res) => {
          const date = new Date(res.date);
          // format date for grouping
          const dateStr = date.toISOString().split('T')[0];

          countsByDate.set(dateStr, (countsByDate.get(dateStr) || 0) + 1);
        });

        // calculate the average
        const totalDays = countsByDate.size;
        const totalReservations = reservations.length;

        return totalReservations / totalDays;
      })
    );
  }

  getAvgServicesPerDay(): Observable<number> {
    return this.http
      .get<ServiceRequest[]>(`${this.baseUrl}/serviceRequests`)
      .pipe(
        map((requests) => {
          if (requests.length === 0) return 0;

          // create a map to group counts by date (formatted as yyyy-mm-dd string)
          const countsByDate = new Map<string, number>();

          requests.forEach((req) => {
            const date = new Date(req.date);
            // format date for grouping
            const dateStr = date.toISOString().split('T')[0];

            countsByDate.set(dateStr, (countsByDate.get(dateStr) || 0) + 1);
          });

          // calculate the average
          const totalDays = countsByDate.size;
          const totalReservations = requests.length;

          return totalReservations / totalDays;
        })
      );
  }

  getEmployeeOfTheMonth(): Observable<string | null> {
    return this.http
      .get<ServiceRequest[]>(`${this.baseUrl}/serviceRequests`)
      .pipe(
        map((serviceRequests) => {
          // Filter only approved requests
          const approvedRequests = serviceRequests.filter(
            (req) => req.requestStatus === 'Completed'
          );

          if (approvedRequests.length === 0) {
            return null; // no approved requests
          }

          // Count approved requests per employeeId
          const counts = new Map<
            string,
            { count: number; employeeName: string }
          >();

          approvedRequests.forEach((req) => {
            const empId = req.employeeId;
            const empName = req.employee?.name || 'Unknown';

            if (!counts.has(empId)) {
              counts.set(empId, { count: 0, employeeName: empName });
            }
            counts.get(empId)!.count += 1;
          });

          // Find employee with max count
          let maxCount = 0;
          let employeeOfTheMonth: string | null = null;

          counts.forEach(({ count, employeeName }) => {
            if (count > maxCount) {
              maxCount = count;
              employeeOfTheMonth = employeeName;
            }
          });

          return employeeOfTheMonth;
        })
      );
  }

  getTopSellingService(): Observable<string | null> {
    return this.http
      .get<ServiceRequest[]>(`${this.baseUrl}/serviceRequests`)
      .pipe(
        map((serviceRequests) => {
          if (serviceRequests.length === 0) return null;

          // Count how many requests per service title
          const counts = new Map<string, number>();

          serviceRequests.forEach((req) => {
            const serviceTitle = req.title;
            counts.set(serviceTitle, (counts.get(serviceTitle) || 0) + 1);
          });

          // Find service with max count
          let maxCount = 0;
          let topService: string | null = null;

          counts.forEach((count, serviceTitle) => {
            if (count > maxCount) {
              maxCount = count;
              topService = serviceTitle;
            }
          });

          return topService;
        })
      );
  }

  getMostBookedRoomType(): Observable<
    'Single' | 'Double' | 'Family' | 'Hall' | 'Suite' | 'Deluxe' | null
  > {
    return this.http.get<Reservation[]>(`${this.baseUrl}/reservations`).pipe(
      map((reservations) => {
        // Filter only approved reservations (optional, depends on your need)
        const approvedReservations = reservations.filter(
          (r) => r.approvalStatus === 'Approved'
        );

        if (approvedReservations.length === 0) return null;

        // Count by roomType
        const counts = new Map<
          'Single' | 'Double' | 'Family' | 'Hall' | 'Suite' | 'Deluxe',
          number
        >();

        approvedReservations.forEach((r) => {
          const roomType = r.room.roomType;
          counts.set(roomType, (counts.get(roomType) || 0) + 1);
        });

        // Determine most booked room type
        let maxCount = 0;
        let mostBooked:
          | 'Single'
          | 'Double'
          | 'Family'
          | 'Hall'
          | 'Suite'
          | 'Deluxe'
          | null = null;

        counts.forEach((count, roomType) => {
          if (count > maxCount) {
            maxCount = count;
            mostBooked = roomType;
          }
        });

        return mostBooked;
      })
    );
  }
}
