import { Component, OnInit } from '@angular/core';
import { ReservationService } from '../../../services/reservation.service';
import { Reservation } from '../../../models/Reservation.model';
import { CommonModule } from '@angular/common';
import { RoomService } from '../../../services/room.service';
import { Room } from '../../../models/Room.model';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { I18nService } from '../../../services/i18n.service';

@Component({
  selector: 'app-my-reservations',
  imports: [CommonModule, RouterModule, ToastModule],
  providers: [MessageService],
  templateUrl: './my-reservations.component.html',
  styleUrls: ['./my-reservations.component.scss'],
})
export class MyReservationsComponent implements OnInit {
  constructor(
    private reservationService: ReservationService,
    private roomService: RoomService,
    private messageService: MessageService,
    private i18nService: I18nService
  ) {}

  reservations: Reservation[] = [];

  subscriptions: Subscription[] = [];

  ngOnInit(): void {
    const userId = localStorage.getItem('id');

    if (!userId) {
      console.warn('⚠️ No user_id found in localStorage');
      return;
    }

    const getReservationsByCustomerIdSub = this.reservationService
      .getReservationsByCustomerId(userId)
      .subscribe({
        next: (res) => {
          console.log('✅ Reservations fetched:', res);
          this.reservations = res;
        },
        error: (err) => {
          console.error('❌ Error fetching reservations', err);
        },
      });
    this.subscriptions.push(getReservationsByCustomerIdSub);
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
    const updateRoomSub = this.roomService
      .updateRoom(reservation.roomId, updatedRoom)
      .subscribe({
        next: () => {
          // ثانيًا: حذف الحجز بعد نجاح تحديث الغرفة
          const cancelReservationSub = this.reservationService
            .cancelReservation(id)
            .subscribe({
              next: () => {
                // حذف الحجز من الواجهة
                this.reservations = this.reservations.filter(
                  (r) => r.id !== id
                );

                this.messageService.add({
                  severity: 'error',
                  summary: `${this.i18nService.t(
                    'shared.toast.reservation-cancelled'
                  )}`,
                });
              },
              error: (err) => {
                console.error('❌ Failed to cancel reservation', err);
                this.messageService.add({
                  severity: 'error',
                  summary: `${this.i18nService.t(
                    'shared.toast.something-went-wrong'
                  )}`,
                });
              },
            });
          this.subscriptions.push(cancelReservationSub);
        },
        error: (err) => {
          console.error('⚠️ Failed to update room status', err);
          this.messageService.add({
            severity: 'error',
            summary: `${this.i18nService.t(
              'shared.toast.something-went-wrong'
            )}`,
          });
        },
      });

    this.subscriptions.push(updateRoomSub);
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
