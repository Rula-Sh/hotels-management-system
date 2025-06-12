import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { BookingService } from '../../../core/services/booking.service';
import { AuthService } from '../../../core/services/auth.service';
import { Service } from '../../../shared/models/Service.model';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { I18nPipe } from '../../../shared/pipes/i18n.pipe';
import { I18nService } from '../../../core/services/i18n.service';

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

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private bookingService: BookingService,
    private messageService: MessageService,
    private authService: AuthService,
    private i18nService: I18nService
  ) {}

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    const userId = user?.id;
    const roomId = this.activatedRoute.snapshot.paramMap.get('roomId');

    if (userId && roomId) {
      this.bookingService.getBookingByUserAndRoom(userId, roomId).subscribe({
        next: (reservation: any) => {
          console.log('📦 Booking fetched:', reservation);
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
              .getApprovedAndInProgressServicesByCustomerAndRoom(userId, roomId)
              .subscribe((services) => {
                console.log('📦 Services fetched:', services);
                this.services = services;
                this.servicesTotal = services.reduce(
                  (sum: number, s: Service) => sum + (s.price || 0),
                  0
                );

                // ✅ المجموع الكلي: غرفة + خدمات
                this.totalCost = this.roomCost + this.servicesTotal;
              });
          } else {
            console.warn('⚠️ No reservation found');
          }
        },
        error: (err) => {
          console.error('❌ Failed to load booking', err);
        },
      });
    }
  }

  payNow() {
    const user = this.authService.getCurrentUser();
    const userId = user?.id;
    const roomId = this.activatedRoute.snapshot.paramMap.get('roomId');
    const reservationId = this.reservation?.id;

    if (!this.reservation || !userId || !roomId || !reservationId) {
      this.messageService.add({
        severity: 'error',
        summary: this.i18nService.t('shared.toast.payment-failed-title'),
        detail: this.i18nService.t('shared.toast.payment-missing-info'),
      });
      return;
    }

    const updatedReservation = {
      ...this.reservation,
      paymentStatus: 'Paid',
      paymentAmount: this.totalCost,
      isCheckedOut: true,
      date: new Date(),
    };

    const updatedRoom = {
      bookedStatus: 'Available',
    };

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
            summary: this.i18nService.t('shared.toast.payment-success-title'),
            detail: this.i18nService.t('shared.toast.payment-success-detail', {
              amount: this.totalCost,
            }),
          });

          setTimeout(() => {
            this.router.navigate(['/']);
          }, 1500);
        },
        error: (err) => {
          console.error('Payment update error:', err);
          this.messageService.add({
            severity: 'error',
            summary: this.i18nService.t('shared.toast.payment-failed-title'),
            detail:
              err.message || this.i18nService.t('shared.toast.payment-error'),
          });
        },
      });
  }
}
