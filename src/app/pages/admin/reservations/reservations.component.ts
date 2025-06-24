import { Component } from '@angular/core';
import { Reservation as Reservation } from '../../../shared/models/Reservation.model';
import { RouterLink } from '@angular/router';
import { ConfirmationService, MessageService, PrimeIcons } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { I18nPipe } from '../../../shared/pipes/i18n.pipe';
import { ReservationService } from '../../../core/services/reservation.service';
import { I18nService } from '../../../core/services/i18n.service';
import { RoomService } from '../../../core/services/room.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-reservations',
  imports: [
    I18nPipe,
    ToastModule,
    ConfirmDialogModule,
    CommonModule,
    ButtonModule,
    RouterLink,
  ],
  providers: [MessageService, ConfirmationService, PrimeIcons],
  templateUrl: './reservations.component.html',
  styleUrl: './reservations.component.scss',
})
export class ReservationsComponent {
  reservations: Reservation[] = [];

  pendingReservations: Reservation[] = [];
  activeReservations: Reservation[] = [];

  subscriptions: Subscription[] = [];
  constructor(
    private ReservationService: ReservationService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private i18n: I18nService,
    private roomService: RoomService
  ) {}

  ngOnInit() {
    this.getreservations();
  }

  getreservations() {
    const getAllReservationsSub =
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
    this.subscriptions.push(getAllReservationsSub);
  }

  approveReservationRequest(reservation: Reservation) {
    reservation.approvalStatus = 'Approved';
    reservation.room.bookedStatus = 'Booked';
    reservation.date = new Date();
    const approveReservationRequestSub =
      this.ReservationService.approveReservationRequest(
        reservation.id,
        reservation
      ).subscribe({
        next: () => {
          // ✅ بعد الموافقة على الحجز، حدّث الغرفة إلى 'Booked'
          const updatedRoom = reservation.room;

          this.roomService
            .updateRoom(reservation.room.id, updatedRoom)
            .subscribe({
              next: () => {
                console.log('Room marked as booked');
              },
              error: (err) => {
                console.error('Failed to update room status:', err);
              },
            });
          console.log('reservation approved');
          this.getreservations();
          this.messageService.add({
            severity: 'success',
            summary: `${this.i18n.t('shared.toast.reservation-approved')}`,
          });
        },
        error: (err) => {
          console.log('Error approving reservation: ' + err);
          this.messageService.add({
            severity: 'error',
            summary: `${this.i18n.t('shared.toast.something-went-wrong')}`,
          });
        },
      });
    this.subscriptions.push(approveReservationRequestSub);
  }

  rejectReservationRequest(reservation: Reservation) {
    reservation.approvalStatus = 'Rejected';
    this.confirmationService.confirm({
      message: `${this.i18n.t(
        'shared.confirm-dialog.confirm-reject-reservation-question'
      )}`,
      header: `${this.i18n.t('shared.confirm-dialog.reject-reservation')}`,
      accept: () => {
        const rejectReservationRequestSub =
          this.ReservationService.rejectReservationRequest(
            reservation.id,
            reservation
          ).subscribe({
            next: () => {
              // ✅ إعادة حالة الغرفة إلى 'Available'
              const updatedRoom = {
                ...reservation.room,
                bookedStatus: 'Available' as 'Available',
              };

              this.roomService
                .updateRoom(reservation.room.id, updatedRoom)
                .subscribe({
                  next: () => {
                    console.log('Room marked as available again.');
                  },
                  error: (err) => {
                    console.error('Failed to update room to available:', err);
                  },
                });
              console.log('Reservation rejected');
              this.getreservations();
              this.messageService.add({
                severity: 'error',
                summary: `${this.i18n.t('shared.toast.reservation-rejected')}`,
              });
            },
            error: (err) => {
              console.log('Error rejecting reservation: ' + err);
              this.messageService.add({
                severity: 'error',
                summary: `${this.i18n.t('shared.toast.something-went-wrong')}`,
              });
            },
          });
        this.subscriptions.push(rejectReservationRequestSub);
      },
      reject: () => {},
    });
  }
  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
