import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { I18nPipe } from '../../../pipes/i18n.pipe';
import { RoomService } from '../../../services/room.service';
import { I18nService } from '../../../services/i18n.service';
import { Room } from '../../../models/Room.model';
import { Reservation } from '../../../models/Reservation.model';
import { ReservationService } from '../../../services/reservation.service';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../services/auth.service';
import { ServiceRequest } from '../../../models/ServiceRequest.model';
import { ServiceService } from '../../../services/service.service';

@Component({
  selector: 'app-room',
  imports: [CommonModule, I18nPipe],
  templateUrl: './room-details.component.html',
  styleUrl: './room-details.component.scss',
})
export class RoomDetailsComponent {
  showToast = false;
  toastMessage = '';
  toastHeader = '';
  toastClass = '';
  room: Room | undefined;
  images: string[] = []; // Should be populated appropriately
  currentIndex: number = 0;
  fadeOut = false;
  approvedServices: ServiceRequest[] = [];
  customerId: string | null = null;
  roomId: string | null = null;
   requestedServicesStatus: { [serviceTitle: string]: string } = {};
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
    private serviceService: ServiceService
  ) {}
  role: string | null = null;
ngOnInit() {
  this.customerId = localStorage.getItem('id');
  this.roomId = this.route.snapshot.paramMap.get('id'); // تحصل الـ roomId من الـ URL

  this.getRoom(); // إذا كانت دالة جلب الغرفة async تأكد من تنفيذ loadApprovedServices بعدها

}

  getRoom() {
  const roomId = this.activatedRoute.snapshot.paramMap.get('id');

  if (roomId) {
    this.roomService.getRoomById(roomId).subscribe({
      next: (value) => {
        this.room = value;
        this.images = this.room?.imagesUrl || [];
        console.log('Room Loaded');

      },
      error: (err) => {
        console.log('Error Retrieving the Room: ' + err);
      },
    });
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

  goBack() {
    this.router.navigate(['/rooms']);
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
