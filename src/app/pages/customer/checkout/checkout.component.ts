import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { BookingService } from '../../../core/services/booking.service';
import { AuthService } from '../../../core/services/auth.service';
import { Service } from '../../../shared/models/Service.model';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { I18nPipe } from '../../../shared/pipes/i18n.pipe';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
  providers: [MessageService],
  imports: [CommonModule, ToastModule, I18nPipe],
  standalone: true,
})
export class CheckoutComponent implements OnInit {
  services: any[] = [];
  servicesTotal: number = 0;
  roomCost: number = 0;
  totalCost: number = 0;
  nightsStayed: number = 1;

  reservation: any;
  isPaid = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private bookingService: BookingService,
    private messageService: MessageService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    const userId = user?.id;
    const roomId = this.activatedRoute.snapshot.paramMap.get('roomId');

    if (userId && roomId) {
      this.bookingService
        .getBookingByUserAndRoom(userId, roomId)
        .subscribe((reservation: any) => {
          if (reservation) {
            this.reservation = reservation;

            const bookDate = new Date(reservation.date);
            const checkOutDate = new Date();
            const diffTime = Math.abs(
              checkOutDate.getTime() - bookDate.getTime()
            );
            this.nightsStayed = Math.max(
              1,
              Math.floor(diffTime / (1000 * 60 * 60 * 24))
            );

            const pricePerNight = reservation.room?.price || 0;
            this.roomCost = this.nightsStayed * pricePerNight;

            // 🔽 حساب الخدمات الموافق عليها
            this.bookingService
              .getApprovedServicesByCustomerAndRoom(userId, roomId)
              .subscribe((services) => {
                this.services = services;
                this.servicesTotal = services.reduce(
                  (sum: number, s: Service) => sum + (s.price || 0),
                  0
                );

                // ✅ المجموع الكلي: غرفة + خدمات
                this.totalCost = this.roomCost + this.servicesTotal;
              });
          }
        });
    }
  }

  payNow() {
    if (!this.reservation) return;

    const updatedReservation = {
      paymentAmount: this.totalCost,
      paymentStatus: 'Paid',
      isCheckedOut: true,
      date: new Date(),
    };

    const updatedRoom = {
      bookedStatus: 'Available',
    };

    const user = this.authService.getCurrentUser();
    const userId = user?.id;
    const roomId = this.activatedRoute.snapshot.paramMap.get('roomId');
    const reservationId = this.reservation.id;

    if (userId && roomId && reservationId) {
      this.bookingService
        .updateReservationAndRoom(
          reservationId,
          roomId,
          updatedReservation,
          updatedRoom
        )
        .subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Payment Successful',
            });
            setTimeout(() => {
              this.router.navigate(['/']);
            }, 1500);
          },
          error: (err) => {
            console.error('Update failed', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Payment update failed',
              detail: err.message || 'Unknown error',
            });
          },
        });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Something went wrong',
      });
    }
  }
}
