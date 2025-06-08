import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { BookingService } from '../../../core/services/booking.service';
import { AuthService } from '../../../core/services/auth.service';
import { Service } from '../../../shared/models/Service.model';
import { CommonModule, } from '@angular/common';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
  providers: [MessageService],
  imports: [CommonModule],
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
    this.bookingService.getBookingByUserAndRoom(userId, roomId).subscribe((reservation: any) => {
      if (reservation) {
        this.reservation = reservation;

        const bookDate = new Date(reservation.date);
        const checkOutDate = new Date();
        const diffTime = Math.abs(checkOutDate.getTime() - bookDate.getTime());
        this.nightsStayed = Math.max(1, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

        const pricePerNight = reservation.room?.price || 0;
        this.roomCost = this.nightsStayed * pricePerNight;

        // 🔽 حساب الخدمات الموافق عليها
        this.bookingService.getApprovedServicesByCustomerAndRoom(userId, roomId).subscribe(services => {
          this.services = services;
          this.servicesTotal = services.reduce((sum: number, s: Service) => sum + (s.price || 0), 0);

          // ✅ المجموع الكلي: غرفة + خدمات
          this.totalCost = this.roomCost + this.servicesTotal;
        });
      }
    });
  }
}

payNow() {
  if (this.reservation) {
    const updatedReservation = {
      ...this.reservation,
      paymentStatus: 'Paid',
      paymentAmount: this.totalCost
    };

    const user = this.authService.getCurrentUser();
    const userId = user?.id;
    const roomId = this.route.snapshot.queryParamMap.get('roomId');

    if (userId && roomId) {
      this.bookingService.updateBookingStatus(userId, roomId, 'Paid').subscribe(() => {
        this.messageService.add({
          severity: 'success',
          summary: 'Payment Successful',
          detail: `You paid ${this.totalCost} JOD`
        });
      });
      this.isPaid = true;
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Payment Failed',
        detail: 'Missing user or room information.'
      });
    }
    this.isPaid = true;

  }
}

}
