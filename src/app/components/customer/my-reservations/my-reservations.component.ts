import { Component, OnInit } from '@angular/core';
import { ReservationService } from '../../../services/reservation.service';
import { Reservation } from '../../../models/Reservation.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-my-reservations',
  imports: [CommonModule],
  templateUrl: './my-reservations.component.html',
  styleUrls: ['./my-reservations.component.scss'],
})
export class MyReservationsComponent implements OnInit {
  constructor(private reservationService: ReservationService) {}

  reservations: Reservation[] = [];

  ngOnInit(): void {
    const userId = localStorage.getItem('user_id');
    if (userId) {
      this.reservationService.getReservationsByCustomerId(userId).subscribe({
        next: (res) => (this.reservations = res),
      });
  }
}
  cancelReservation(id: string) {
  this.reservationService.cancelReservation(id).subscribe({
    next: () => {
      this.reservations = this.reservations.filter(r => r.id !== id);
    },
    error: (err) => {
      console.error('Failed to cancel reservation', err);
    }
  });
}

}
