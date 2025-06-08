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

@Component({
  selector: 'app-room',
  imports: [
    CommonModule,
    I18nPipe,
    RouterLink,
    ToastModule,
    ConfirmDialogModule,
    ButtonModule,
  ],
  providers: [MessageService, ConfirmationService, MessageService],
  templateUrl: './room-details.component.html',
  styleUrl: './room-details.component.scss',
})
export class RoomDetailsComponent {
  room: Room | undefined;
  images: string[] = []; // Should be populated appropriately
  currentIndex: number = 0;
  fadeOut = false;
  approvedServices: ServiceRequest[] = [];
  userId: string | null = null;
  roomId: string | null = null;
  requestedServicesStatus: { [serviceTitle: string]: string } = {};
  isRoomBookedByUser: boolean = false;
  subscriptions: Subscription[] = [];

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
    private i18n: I18nService
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
          const approvedReservation = reservations.find(
            (res) =>
              res.roomId === this.roomId && res.approvalStatus === 'Approved'
          );
          // هنا نحدث حالة الحجز عند المستخدم
          this.isRoomBookedByUser = !!approvedReservation;

          if (approvedReservation && this.room) {
            // ✅ تحديث حالة الغرفة إلى "Booked"
            const updatedRoom: Room = { ...this.room, bookedStatus: 'Booked' };

            this.roomService.updateRoom(this.room.id!, updatedRoom).subscribe({
              next: () => {
                this.room!.bookedStatus = 'Booked';
                this.messageService.add({
                  severity: 'info',
                  summary: `${this.i18n.t('room.room')} ${
                    this.room!.title
                  } ${this.i18n.t('shared.toast.status-updated-to-booked')}`,
                });
              },
              error: () => {
                console.error('Failed to update room status to Booked');
              },
            });
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
          next: (value) => {
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
                      room.bookedStatus = 'Pending';
                      this.messageService.add({
                        severity: 'success',
                        summary: `${this.i18nService.t('room.room')} "${
                          room.title
                        }" ${this.i18nService.t(
                          'shared.toast.booked-waiting-for-admin-approval'
                        )}`,
                      });
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
}
