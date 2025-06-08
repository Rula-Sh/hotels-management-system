import { Component, ViewChild } from '@angular/core';
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
import { Subject, Subscription } from 'rxjs';
// import { Subject, Subscription } from 'rxjs';
// import { DataTablesModule } from 'angular-datatables';

@Component({
  selector: 'app-reservations',
  imports: [
    I18nPipe,
    ToastModule,
    ConfirmDialogModule,
    CommonModule,
    ButtonModule,
    RouterLink,
    // DataTablesModule,
  ],
  providers: [MessageService, ConfirmationService, PrimeIcons],
  templateUrl: './reservations.component.html',
  styleUrl: './reservations.component.scss',
})
export class ReservationsComponent {
  // @ViewChild('pendingTable', { static: false }) pendingTable: any;
  // @ViewChild('activeTable', { static: false }) activeTable: any;

  reservations: Reservation[] = [];

  // dtOptionsPending: any = {};
  // dtTriggerPending: Subject<any> = new Subject<any>();
  // dtOptionsActive: any = {};
  // dtTriggerActive: Subject<any> = new Subject<any>();

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

  role: string | null = null;
  ngOnInit() {
    // this.dtOptionsPending = {
    //   pagingType: 'full_numbers',
    //   pageLength: 10,
    //   lengthMenu: [5, 10, 15, 20, 25],
    //   responsive: true,
    //   // paging:false, // to disable pages in the table
    //   // ordering:false, // to disable order by in the table
    //   // order: [0,'asc'], // orders the first column in ascending order
    //   // lengthChange: false, // disables selecting the lengthMenu
    //   // scrollY: '400, // to add scroll to the datatable
    //   // language: {
    //   //   searchPlaceholder: 'Search...',
    //   // },
    // };

    // this.dtOptionsActive = {
    //   pagingType: 'full_numbers',
    //   pageLength: 10,
    //   lengthMenu: [5, 10, 15, 20, 25],
    //   responsive: true,
    // };

    this.getreservations();
    this.role = localStorage.getItem('user_role');
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

          // const pendingTable = $(this.pendingTable?.nativeElement).DataTable();
          // const activeTable = $(this.activeTable?.nativeElement).DataTable();

          // if (pendingTable) {
          //   pendingTable.destroy();
          // }
          // if (activeTable) {
          //   activeTable.destroy();
          // }

          // // Trigger DataTable render
          // setTimeout(() => {
          //   this.dtTriggerPending.next(null);
          //   this.dtTriggerActive.next(null);
          // }, 0);

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
    const approveReservationRequestSub =
      this.ReservationService.approveReservationRequest(
        reservation.id,
        reservation
      ).subscribe({
        next: (value) => {
          // ✅ بعد الموافقة على الحجز، حدّث الغرفة إلى 'Booked'
          const updatedRoom = {
            ...reservation.room,
            bookedStatus: 'Booked' as 'Booked',
          };

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
            next: (value) => {
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
