import { Component } from '@angular/core';
import { I18nPipe } from '../../../pipes/i18n.pipe';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ConfirmationService, MessageService, PrimeIcons } from 'primeng/api';
import { Room } from '../../../models/Room.model';
import { RoomService } from '../../../services/room.service';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ReservationService } from '../../../services/reservation.service';
import { Reservation } from '../../../models/Reservation.model';
import { User } from '../../../models/User.model';
import { I18nService } from '../../../services/i18n.service';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-rooms',
  imports: [
    I18nPipe,
    ToastModule,
    ConfirmDialogModule,
    CommonModule,
    ButtonModule,
    RouterLink,
    FormsModule,
  ],
  providers: [MessageService, ConfirmationService, PrimeIcons],
  templateUrl: './rooms.component.html',
  styleUrl: './rooms.component.scss',
})
export class RoomsComponent {
  rooms: Room[] = [];
  user: User | null = null;

  searchInput: string = '';
  sortBy: 'title' | 'type' | 'hotel' | 'capacity' | 'price' | '' = '';
  filteredRooms: Room[] = [];
  sortDirection: 'Ascending' | 'Descending' = 'Ascending';

  subscriptions: Subscription[] = [];

  get lang(): 'en' | 'ar' {
    return this.i18nService.getLanguage();
  }

  constructor(
    private roomService: RoomService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private reservationService: ReservationService,
    private authService: AuthService,
    private i18nService: I18nService
  ) {}

  role: string | null = null;
  ngOnInit() {
    this.getRooms();
    this.role = localStorage.getItem('user_role');
    // fetch current user
    if (this.authService) {
      try {
        this.user = this.authService.getCurrentUser();
      } catch {
        this.user = null;
      }
    }
  }

  getRooms() {
    const getAllRoomsSub = this.roomService.getAllRooms().subscribe({
      next: (value) => {
        this.rooms = value;
        console.log('Rooms Loaded Successfuly');
        this.applyFilters();
      },
      error: (err) => {
        console.log(`Failed to Load Rooms: ${err}`);
      },
    });
    this.subscriptions.push(getAllRoomsSub);
  }

  applyFilters() {
    this.filteredRooms = this.rooms
      .filter((room) =>
        room.title.toLowerCase().includes(this.searchInput.toLowerCase())
      )
      .sort((a, b) => {
        let result = 0;

        if (this.sortBy === 'title') {
          result = a.title.localeCompare(b.title);
        } else if (this.sortBy === 'type') {
          result = a.roomType.localeCompare(b.roomType);
        } else if (this.sortBy === 'hotel') {
          result = a.hotel.localeCompare(b.hotel);
        } else if (this.sortBy === 'capacity') {
          result = a.capacity - b.capacity;
        } else if (this.sortBy === 'price') {
          result = a.price - b.price;
        }

        return this.sortDirection === 'Ascending' ? result : -result;
      });
  }

  onSearchChange() {
    this.applyFilters();
  }

  onSortChange(value: string) {
    this.sortBy = value as 'title' | 'type' | 'hotel' | 'capacity' | 'price';
    this.applyFilters();
  }

  toggleSortDirection() {
    this.sortDirection =
      this.sortDirection === 'Ascending' ? 'Descending' : 'Ascending';
    this.applyFilters();
  }

  deleteRoom(id: string) {
    this.confirmationService.confirm({
      message: `${this.i18nService.t(
        'shared.confirm-dialog.confirm-remove-room-question'
      )}`,
      header: `${this.i18nService.t('shared.confirm-dialog.remove-room')}`,
      accept: () => {
        const removeRoomSub = this.roomService.removeRoom(id).subscribe({
          next: (value) => {
            console.log('Room deleted');
            this.getRooms();
          },
          error(err) {
            console.log('Error deleting room: ' + err);
          },
        });
        this.messageService.add({
          severity: 'error',
          summary: `${this.i18nService.t('shared.toast.room-removed')}`,
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
}
