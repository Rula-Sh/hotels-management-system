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
import { Dialog } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { DatePicker } from 'primeng/datepicker';

@Component({
  selector: 'app-my-reservations',
  imports: [
    CommonModule,
    RouterModule,
    ToastModule,
    I18nPipe,
    Dialog,
    ButtonModule,
    InputTextModule,
    FormsModule,
    DatePicker,
  ],
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

  roomToRebook!: Room;

  dateDialogVisible: boolean = false;
  rangeDates: Date[] | undefined;
  todayDate = new Date();
  disabledDates: Date[] = [];
  calendarMaxDate: Date = new Date(8640000000000000); // A very large date used as the default maximum date (means "no limit")
  maxDate: Date = this.calendarMaxDate;

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
    if (this.rangeDates == null) {
      this.messageService.add({
        severity: 'warn',
        summary: `${this.i18nService.t('shared.toast.select-date')}`,
      });
      return;
    }

    // if the customer selected one date, add the next day as checkOutDate
    if (this.rangeDates[1] == null) {
      let nextDay = new Date();
      nextDay.setDate(this.rangeDates[0].getDate() + 1);
      this.rangeDates[1] = nextDay;
    }

    // temporarily fixed the checkInDate being in the prev day... i dont know why it changes to the prev day when i save it in the db.json //TODO fix the main issue
    this.rangeDates[0].setDate(this.rangeDates[0].getDate() + 1);

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
            checkInDate: this.rangeDates![0],
            checkOutDate: this.rangeDates![1],
          };

          const createReservationSub = this.reservationService
            .createReservation(reservation)
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

                setTimeout(() => {
                  this.router.navigate(['/rooms']);
                }, 1500);
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
    this.dateDialogVisible = false;
    this.subscriptions.push(getReservationsByCustomerIdSub);
  }

  // for reservation date selection
  showDateDialog(room: Room) {
    this.reservationService.getRoomReservationsDates(room.id).subscribe({
      next: (dates) => {
        var reservationDuration = [];
        for (let i = 0; i < dates.length; i++) {
          var dateRange = dates[i];
          const dateRange0 = new Date(dateRange[0]).setDate(
            new Date(dateRange[0]).getDate() - 1
          );
          var currentDate: Date = new Date(dateRange0);
          while (
            new Date(currentDate).getDate() < new Date(dateRange[1]).getDate()
          ) {
            reservationDuration.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
          }
        }

        // this.disabledDates = dates.flat().map((d) => new Date(d));
        this.disabledDates = reservationDuration.map((d) => new Date(d));
        console.table(this.disabledDates);
      },
      error: (err) => {
        console.log('Error getting reservaed dates:', err);
        this.messageService.add({
          severity: 'error',
          summary: `${this.i18nService.t(
            'shared.toast.error-getting-reserved-dates'
          )}`,
        });
      },
    });
    this.dateDialogVisible = true;
    this.roomToRebook = room;
  }

  // disable all the dates after the booked dates... so that the customer cannot set the checkOutDate after a previously booked date
  startDateChanged(e: any) {
    // if the event is missing or the user hasn't picked a start date yet, reset maxDate
    if (!e || !this.rangeDates || this.rangeDates.length < 1) {
      this.maxDate = this.calendarMaxDate;
      return;
    }

    // Get the selected checkInDate and remove its time... to compare only the date
    const checkInDate = new Date(this.rangeDates[0]);
    checkInDate.setHours(0, 0, 0, 0);

    // remove time and sort the disabled dates from earliest to latest
    const disabledDatesSorted = this.disabledDates
      .map((d) => {
        const cleanDate = new Date(d);
        cleanDate.setHours(0, 0, 0, 0); // setHours(0, 0, 0, 0) removes the time part (so i only compare the day).
        return cleanDate;
      })
      .sort((a, b) => a.getTime() - b.getTime()); // Sort by date

    // Find the first disabled date after the selected checkInDate
    for (const disabledDate of disabledDatesSorted) {
      if (disabledDate > checkInDate) {
        // Set maxDate to the day before the disabled date
        const newMaxDate = new Date(disabledDate);
        newMaxDate.setDate(newMaxDate.getDate() - 1);
        this.maxDate = newMaxDate;
        return;
      }
    }

    // If no disabled dates after the selected date, allow selecting any end date
    this.maxDate = this.calendarMaxDate;
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  get lang(): 'ar' | 'en' {
    // لو عندك خدمة i18nService مع خاصية getLanguage()
    return this.i18nService.getLanguage();
  }
}
