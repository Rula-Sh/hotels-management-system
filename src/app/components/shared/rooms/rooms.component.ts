import { Component } from '@angular/core';
import { I18nPipe } from '../../../pipes/i18n.pipe';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ConfirmationService, MessageService, PrimeIcons } from 'primeng/api';
import { Room } from '../../../models/Room.model';
import { RoomService } from '../../../services/room.service';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ReservationService } from '../../../services/reservation.service';
import { Reservation } from '../../../models/Reservation.model';
import { User } from '../../../models/User.model';
import { NgbToastModule } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-rooms',
  imports: [
    I18nPipe,
    ToastModule,
    ConfirmDialogModule,
    CommonModule,
    ButtonModule,
    NgbToastModule,
    RouterLink,
  ],
  providers: [MessageService, ConfirmationService, PrimeIcons],
  templateUrl: './rooms.component.html',
  styleUrl: './rooms.component.scss',
})
export class RoomsComponent {
  showToast = false;
  toastMessage = '';
  toastHeader = '';
  toastClass = '';
  rooms: Room[] = [];
  user: User | null = null;
  constructor(
    private roomService: RoomService,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private reservationService: ReservationService,
    private authService: AuthService
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
    this.roomService.getAllRooms().subscribe({
      next: (value) => {
        this.rooms = value;
        console.log('Rooms Loaded Successfuly');
      },
      error: (err) => {
        console.log(`Failed to Load Rooms: ${err}`);
      },
    });
  }

  deleteRoom(id: string) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to remove this room?',
      header: 'Remove Room',
      accept: () => {
        this.roomService.RemoveRoom(id).subscribe({
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
          summary: 'Room Removed',
        });
      },
      reject: () => {},
    });
  }
  bookRoom(room: Room) {
    this.showToast = false;
    const user = this.authService.getCurrentUser();

    if (!user) {
      this.toastMessage = 'Please login first.';
      this.toastClass = 'bg-warning text-dark';
      this.showToast = true;
      return;
    }

    // 👇 التحقق من وجود حجز سابق
    this.reservationService.getReservationsByCustomerId(user.id).subscribe({
      next: (reservations) => {
        const alreadyBooked = reservations.some(
          (res) => res.roomId === room.id
        );

        if (alreadyBooked) {
          this.toastMessage = `You already sent a booking request for "${room.title}".`;
          this.toastClass = 'bg-info text-white';
          this.showToast = true;

          setTimeout(() => {
            this.showToast = false;
          }, 3000);
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

        this.reservationService.createReservation(reservation).subscribe({
          next: () => {
            const updatedRoom: Room = { ...room, bookedStatus: 'Pending' };
            this.roomService.updateRoom(room.id, updatedRoom).subscribe({
              next: () => {
                this.toastMessage = `Room "${room.title}" booked! Waiting for admin approval.`;
                this.toastClass = 'bg-success text-light';
                this.showToast = true;
                room.bookedStatus = 'Pending';

                setTimeout(() => {
                  this.showToast = false;
                }, 3000);
              },
              error: () => {
                this.toastMessage = 'Room booked but failed to update status.';
                this.toastClass = 'bg-warning text-dark';
                this.showToast = true;
              },
            });
          },
          error: () => {
            this.toastMessage = 'Booking failed. Please try again later.';
            this.toastClass = 'bg-danger text-light';
            this.showToast = true;
          },
        });
      },
      error: () => {
        this.toastMessage = 'Error checking previous reservations.';
        this.toastClass = 'bg-danger text-light';
        this.showToast = true;
      },
    });
  }
}
