import { Component, OnInit } from '@angular/core';
import { ReservationService } from '../../../core/services/reservation.service';
import { Reservation } from '../../../shared/models/Reservation.model';
import { CommonModule } from '@angular/common';
import { RoomService } from '../../../core/services/room.service';
import { Room } from '../../../shared/models/Room.model';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { I18nService } from '../../../core/services/i18n.service';
import { I18nPipe } from '../../../shared/pipes/i18n.pipe';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-my-reservations',
  imports: [CommonModule, RouterModule, ToastModule, I18nPipe],
  providers: [MessageService],
  templateUrl: './my-reservations.component.html',
  styleUrls: ['./my-reservations.component.scss'],
})
export class MyReservationsComponent implements OnInit {
  constructor(
    private router: Router,
    private reservationService: ReservationService,
    private roomService: RoomService,
    private messageService: MessageService,
    private i18nService: I18nService,
    private authService: AuthService
  ) {}

  reservations: Reservation[] = [];

  subscriptions: Subscription[] = [];

  ngOnInit(): void {
    const userId = localStorage.getItem('id');

    if (!userId) {
      console.warn('⚠️ No user id found in localStorage');
      return;
    }

    const getReservationsByCustomerIdSub = this.reservationService
      .getReservationsByCustomerId(userId)
      .subscribe({
        next: (res) => {
          console.log('✅ Reservations fetched:', res);
          // Sort reservations by status then checkout
          this.reservations = res.sort((a, b) => {
            const getPriority = (r: any) => {
              if (r.approvalStatus === 'Pending' && !r.isCheckedOut) return 0;
              if (r.approvalStatus === 'Approved' && !r.isCheckedOut) return 1;
              if (r.approvalStatus === 'Approved' && r.isCheckedOut) return 2;
              if (r.approvalStatus === 'Rejected') return 3;
              return 5; // fallback for unexpected cases
            };

            return getPriority(a) - getPriority(b);
          });
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

  bookRoom(room: Room) {
    const user = this.authService.getCurrentUser();

    if (!user) {
      this.messageService.add({
        severity: 'warn',
        summary: `${this.i18nService.t('shared.toast.login-first')}`,
      });
      return;
    }

    // 👇 التحقق من وجود حجز سابق
    const getReservationsByCustomerIdSub = this.reservationService
      .getReservationsByCustomerId(user.id)
      .subscribe({
        next: (reservations) => {
          const alreadyBooked = reservations.some(
            (res) => res.roomId === room.id && !res.isCheckedOut
          );

          if (alreadyBooked) {
            this.messageService.add({
              severity: 'info',
              summary: `${this.i18nService.t(
                'shared.toast.already-sent-a-booking-request'
              )} "${room.title}".`,
            });
            return;
          }

          // 🟢 إذا لم يكن هناك حجز مسبق، إنشاء الحجز
          const reservation: Omit<Reservation, 'id'> = {
            customer: user,
            customerId: user.id,
            roomId: room.id,
            room: room,
            date: new Date(),
            paymentAmount: room.price,
            paymentStatus: 'Unpaid',
            approvalStatus: 'Pending',
            isCheckedOut: false,
          };

          const createReservationSub = this.reservationService
            .createReservation(reservation)
            .subscribe({
              next: () => {
                const updatedRoom: Room = { ...room, bookedStatus: 'Pending' };
                const updateRoomSub = this.roomService
                  .updateRoom(room.id, updatedRoom)
                  .subscribe({
                    next: () => {
                      this.messageService.add({
                        severity: 'success',
                        summary: `${this.i18nService.t('room.room')} "${
                          room.title
                        }" ${this.i18nService.t(
                          'shared.toast.booked-waiting-for-admin-approval'
                        )}`,
                      });

                      room.bookedStatus = 'Pending';
                    },
                    error: () => {
                      this.messageService.add({
                        severity: 'error',
                        summary: `${this.i18nService.t(
                          'shared.toast.booked-but-failed-to-update-status'
                        )}`,
                      });
                    },
                  });
                this.subscriptions.push(updateRoomSub);
              },
              error: () => {
                this.messageService.add({
                  severity: 'error',
                  summary: `${this.i18nService.t(
                    'shared.toast.something-went-wrong'
                  )}`,
                });
              },
            });
          this.subscriptions.push(createReservationSub);
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: `${this.i18nService.t(
              'shared.toast.error-getting-reservations'
            )}`,
          });
        },
      });
    this.subscriptions.push(getReservationsByCustomerIdSub);
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
  get lang(): 'ar' | 'en' {
    // لو عندك خدمة i18nService مع خاصية getLanguage()
    return this.i18nService.getLanguage();
  }
}
