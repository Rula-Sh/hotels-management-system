import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { BookingService } from '../../../core/services/booking.service';
import { AuthService } from '../../../core/services/auth.service';
import { Service } from '../../../shared/models/Service.model';
import { CommonModule, } from '@angular/common';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
  providers: [MessageService],
  imports: [CommonModule,ToastModule],
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
    private route: ActivatedRoute,
    private bookingService: BookingService,
    private messageService: MessageService,
    private authService: AuthService
  ) {}

ngOnInit() {
  const user = this.authService.getCurrentUser();
  const userId = user?.id;
 const roomId = this.route.snapshot.paramMap.get('roomId');


  if (userId && roomId) {
  this.bookingService.getBookingByUserAndRoom(userId, roomId).subscribe({
    next: (reservation: any) => {
      console.log('📦 Booking fetched:', reservation);
      if (reservation) {
        this.reservation = reservation;
this.isPaid = reservation.paymentStatus === 'Paid';

        const bookDate = new Date(reservation.date);
        const checkOutDate = new Date();
        const diffTime = Math.abs(checkOutDate.getTime() - bookDate.getTime());
        this.nightsStayed = Math.max(1, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

        const pricePerNight = reservation.room?.price || 0;
        this.roomCost = this.nightsStayed * pricePerNight;

        this.bookingService.getApprovedServicesByCustomerAndRoom(userId, roomId).subscribe(services => {
          console.log('📦 Services fetched:', services);
          this.services = services;
          this.servicesTotal = services.reduce((sum: number, s: Service) => sum + (s.price || 0), 0);
          this.totalCost = this.roomCost + this.servicesTotal;
        });
      } else {
        console.warn('⚠️ No reservation found');
      }
    },
    error: err => {
      console.error('❌ Failed to load booking', err);
    }
  });
}

}

payNow() {
  const user = this.authService.getCurrentUser();
  const userId = user?.id;
  const roomId = this.route.snapshot.paramMap.get('roomId'); // هنا نفس الطريقة المستخدمة في ngOnInit

  if (!this.reservation || !userId || !roomId) {
    this.messageService.add({
      severity: 'error',
      summary: 'Payment Failed',
      detail: 'Missing reservation or user information.'
    });
    return;
  }

  // تحضير التحديث مع حالة الدفع والمبلغ
  const updatedReservation = {
    ...this.reservation,
    paymentStatus: 'Paid',
    paymentAmount: this.totalCost
  };

  // نستخدم updateReservation لتحديث الحجز بالكامل
  this.bookingService.updateReservation(this.reservation.id, updatedReservation).subscribe({
    next: (updatedRes) => {
      this.reservation = updatedRes;  // تحديث المتغير المحلي
      this.isPaid = true;             // تعطيل زر الدفع

      this.messageService.add({
        severity: 'success',
        summary: 'Payment Successful',
        detail: `You paid ${this.totalCost} JOD`
      });
    },
    error: (err) => {
      console.error('Payment update error:', err);
      this.messageService.add({
        severity: 'error',
        summary: 'Payment Failed',
        detail: 'An error occurred while processing payment.'
      });
    }
  });
}




}
