import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { I18nPipe } from '../../../pipes/i18n.pipe';
import { RoomService } from '../../../../core/services/room.service';
import { I18nService } from '../../../../core/services/i18n.service';
import { Room } from '../../../models/Room.model';
import { Reservation } from '../../../models/Reservation.model';
import { ReservationService } from '../../../../core/services/reservation.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AuthService } from '../../../../core/services/auth.service';
import { ServiceRequest } from '../../../models/ServiceRequest.model';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ButtonModule } from 'primeng/button';
import { Subscription } from 'rxjs';
import { ServiceService } from '../../../../core/services/service.service';
import { Dialog } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { DatePicker } from 'primeng/datepicker';

@Component({
  selector: 'app-room',
  imports: [
    CommonModule,
    I18nPipe,
    RouterLink,
    ToastModule,
    ConfirmDialogModule,
    ButtonModule,
    Dialog,
    ButtonModule,
    InputTextModule,
    FormsModule,
    DatePicker,
  ],
  providers: [MessageService, ConfirmationService, MessageService],
  templateUrl: './room-details.component.html',
  styleUrl: './room-details.component.scss',
})
export class RoomDetailsComponent {
  room: Room | undefined;
  reservation: Reservation | undefined;
  images: string[] = []; // Should be populated appropriately
  currentIndex: number = 0;
  fadeOut = false;
  requestedUserServices: ServiceRequest[] = [];
  userId: string | null = null;
  roomId: string | null = null;
  requestedServicesStatus: { [serviceTitle: string]: string } = {};
  isRoomBookedByUser: boolean = false;
  subscriptions: Subscription[] = [];

  dateDialogVisible: boolean = false;
  rangeDates: Date[] | undefined;
  todayDate = new Date();
  disabledDates: Date[] = [];

  get lang(): 'en' | 'ar' {
    return this.i18nService.getLanguage();
  }

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private roomService: RoomService,
    private i18nService: I18nService,
    private reservationService: ReservationService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private i18n: I18nService,
    private serviceService: ServiceService
  ) {}

  role: string | null = null;
  ngOnInit() {
    this.userId = localStorage.getItem('id');
    this.role = localStorage.getItem('user_role');
    this.roomId = this.route.snapshot.paramMap.get('id'); // تحصل الـ roomId من الـ URL

    this.getRoom(); // إذا كانت دالة جلب الغرفة async تأكد من تنفيذ loadApprovedServices بعدها
    if (this.userId && this.roomId) {
      const sub = this.reservationService
        .getReservationsByCustomerId(this.userId)
        .subscribe((reservations) => {
          this.reservation = reservations.find(
            (res) => res.roomId === this.roomId
          );
          // هنا نحدث حالة الحجز عند المستخدم
          this.isRoomBookedByUser = !!this.reservation;
          if (this.isRoomBookedByUser) {
            this.getServices();
          }
        });

      this.subscriptions.push(sub);
    }
  }

  getRoom() {
    const roomId = this.activatedRoute.snapshot.paramMap.get('id');

    if (roomId) {
      const getRoomByIdSub = this.roomService.getRoomById(roomId).subscribe({
        next: (value) => {
          this.room = value;
          this.images = this.room?.imagesUrl || [];
          console.log('Room Loaded');
        },
        error: (err) => {
          console.log('Error Retrieving the Room: ' + err);
        },
      });
      this.subscriptions.push(getRoomByIdSub);
    } else {
      console.log('Room ID is null');
    }
  }

  getServices() {
    this.serviceService.getServicesByCustomerId(this.userId!).subscribe({
      next: (value) => {
        this.requestedUserServices = value.filter((servReq) => {
          return (
            servReq.roomId == this.roomId && this.room?.bookedStatus == 'Booked'
          );
        });
      },
      error: (err) => {
        console.log('Error getting services', err);
      },
    });
  }

  get currentImageUrl(): string {
    return (
      this.room?.imagesUrl[this.currentIndex] ||
      '../../../../../assets/images/default-room-image.jpg'
    );
  }

  nextImage() {
    if (this.images.length === 0) return;
    this.fadeOut = true;
    setTimeout(() => {
      this.currentIndex = (this.currentIndex + 1) % this.images.length;
      this.fadeOut = false;
    }, 500);
  }

  prevImage() {
    if (this.images.length === 0) return;
    this.fadeOut = true;
    setTimeout(() => {
      this.currentIndex =
        (this.currentIndex - 1 + this.images.length) % this.images.length;
      this.fadeOut = false;
    }, 500);
  }

  slide(): string {
    return `translateX(-${this.currentIndex * 100}%)`;
  }

  deleteRoom(id: string | undefined) {
    this.confirmationService.confirm({
      message: `${this.i18n.t(
        'shared.confirm-dialog.confirm-remove-room-question'
      )}`,
      header: `${this.i18n.t('shared.confirm-dialog.remove-room')}`,
      accept: () => {
        const removeRoomSub = this.roomService.removeRoom(id!).subscribe({
          next: () => {
            console.log('Room deleted');
            this.router.navigate(['/rooms']);
          },
          error(err) {
            console.log('Error deleting room: ' + err);
          },
        });
        this.messageService.add({
          severity: 'error',
          summary: `${this.i18n.t('shared.toast.room-removed')}`,
        });

        this.subscriptions.push(removeRoomSub);
      },
      reject: () => {},
    });
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
            (res) => res.roomId === room.id
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

  showDateDialog() {
    this.reservationService.getRoomReservationsDates(this.roomId!).subscribe({
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
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
