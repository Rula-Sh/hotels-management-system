import { Component, OnInit } from '@angular/core';
import { ReservationService } from '../../../services/reservation.service';
import { Reservation } from '../../../models/Reservation.model';
import { CommonModule } from '@angular/common';
import { RoomService } from '../../../services/room.service';
import { NgbToastModule } from '@ng-bootstrap/ng-bootstrap';
import { Room } from '../../../models/Room.model';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-my-reservations',
  imports: [CommonModule, NgbToastModule, RouterModule],
  templateUrl: './my-reservations.component.html',
  styleUrls: ['./my-reservations.component.scss'],
})
export class MyReservationsComponent implements OnInit {
  constructor(
    private reservationService: ReservationService,
    private roomService: RoomService
  ) {}

  reservations: Reservation[] = [];
  showToast = false;
  toastMessage = '';
  toastClass = '';

  ngOnInit(): void {
    const userId = localStorage.getItem('id');

    if (!userId) {
      console.warn('⚠️ No user_id found in localStorage');
      return;
    }

    this.reservationService.getReservationsByCustomerId(userId).subscribe({
      next: (res) => {
        console.log('✅ Reservations fetched:', res);
        this.reservations = res;
      },
      error: (err) => {
        console.error('❌ Error fetching reservations', err);
      },
    });
  }

  cancelReservation(id: string): void {
    console.log('🔁 Trying to cancel reservation with ID:', id);

    const reservation = this.reservations.find((r) => r.id === id);
    if (!reservation) {
      console.warn('⚠️ Reservation not found');
      return;
    }
    const updatedRoom: Room = {
      ...reservation.room,
      bookedStatus: 'Available',
    };

    // أولاً: تحديث حالة الغرفة
    this.roomService.updateRoom(reservation.roomId, updatedRoom).subscribe({
      next: () => {
        // ثانيًا: حذف الحجز بعد نجاح تحديث الغرفة
        this.reservationService.cancelReservation(id).subscribe({
          next: () => {
            // حذف الحجز من الواجهة
            this.reservations = this.reservations.filter((r) => r.id !== id);

            // عرض رسالة نجاح
            this.toastMessage = `✅ Reservation for "${reservation.room.title}" cancelled.`;
            this.toastClass = 'bg-success text-light';
            this.showToast = true;

            setTimeout(() => {
              this.showToast = false;
            }, 3000);
          },
          error: (err) => {
            console.error('❌ Failed to cancel reservation', err);
            this.toastMessage = '❌ Failed to cancel reservation.';
            this.toastClass = 'bg-danger text-light';
            this.showToast = true;
          },
        });
      },
      error: (err) => {
        console.error('⚠️ Failed to update room status', err);
        this.toastMessage = '⚠️ Failed to update room status.';
        this.toastClass = 'bg-warning text-dark';
        this.showToast = true;
      },
    });
  }
}
