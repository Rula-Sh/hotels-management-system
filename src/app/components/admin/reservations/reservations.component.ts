import { Component } from '@angular/core';
import { Reservation as Reservation } from '../../../models/Reservation.model';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService, PrimeIcons } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { I18nPipe } from '../../../pipes/i18n.pipe';
import { AuthService } from '../../../services/auth.service';
import { ReservationService } from '../../../services/reservation.service';

@Component({
  selector: 'app-reservations',
  imports: [
    I18nPipe,
    ToastModule,
    ConfirmDialogModule,
    CommonModule,
    ButtonModule,
  ],
  providers: [MessageService, ConfirmationService, PrimeIcons],
  templateUrl: './reservations.component.html',
  styleUrl: './reservations.component.scss',
})
export class ReservationsComponent {
  reservations: Reservation[] = [
    {
      id: '',
      roomId: '',
      customerId: '',
      date: new Date(),
      approvalStatus: 'Pending',
      paymentStatus: 'Unpaid',
      paymentAmmount: 0,
      customer: {
        id: '',
        name: '',
        email: '',
        password: '',
        phone: '',
        role: 'customer',
      },
      room: {
        id: '',
        title: '',
        roomType: 'Room',
        floor: 0,
        hotel: '',
        details: '',
        bookedStatus: 'Available',
        price: 0,
        imageUrl: '',
      },
    },
  ];

  pendingReservations: Reservation[] = [];
  activeReservations: Reservation[] = [];

  constructor(
    private ReservationService: ReservationService,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  role: string | null = null;
  ngOnInit() {
    this.getreservations();
    this.role = localStorage.getItem('user_role');
  }

  getreservations() {
    this.ReservationService.getAllReservations().subscribe({
      next: (value) => {
        this.reservations = value;
        this.pendingReservations = this.reservations.filter(
          (r) => r.approvalStatus === 'Pending'
        );
        this.activeReservations = this.reservations.filter(
          (r) => r.approvalStatus === 'Approved'
        );
        console.log('reservations Loaded Successfuly');
      },
      error: (err) => {
        console.log(`Failed to Load reservations: ${err}`);
      },
    });
  }

  showReservationDetails(id: string) {
    this.router.navigate([`reservation-details/${id}`]);
  }

  ApproveReservationRequest(id: string, reservation: Reservation) {
    this.ReservationService.ApproveReservationRequest(
      id,
      reservation
    ).subscribe({
      next: (value) => {
        console.log('reservation approved');
        this.getreservations();
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Reservation approved',
        });
      },
      error: (err) => {
        console.log('Error approving reservation: ' + err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to approve reservation',
        });
      },
    });
  }

  RejectReservationRequest(id: string, reservation: Reservation) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to reject this reservation?',
      header: 'Reject Reservation',
      accept: () => {
        this.ReservationService.RejectReservationRequest(
          id,
          reservation
        ).subscribe({
          next: (value) => {
            console.log('Reservation rejected');
            this.getreservations();
            this.messageService.add({
              severity: 'warn',
              summary: 'Rejected',
              detail: 'Reservation has been rejected',
            });
          },
          error: (err) => {
            console.log('Error rejecting reservation: ' + err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to reject reservation',
            });
          },
        });
      },
      reject: () => {},
    });
  }
}
