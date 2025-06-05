import { Component, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService, PrimeIcons } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { I18nPipe } from '../../../pipes/i18n.pipe';
import { ServiceService } from '../../../services/service.service';
import { ServiceRequest } from '../../../models/ServiceRequest.model';
import { I18nService } from '../../../services/i18n.service';
import { Subject, Subscription } from 'rxjs';
// import { Subject } from 'rxjs';
// import { DataTablesModule } from 'angular-datatables';

@Component({
  selector: 'app-requests',
  imports: [
    I18nPipe,
    ToastModule,
    ConfirmDialogModule,
    CommonModule,
    ButtonModule,
    // DataTablesModule,
  ],
  providers: [MessageService, ConfirmationService, PrimeIcons],
  templateUrl: './requests.component.html',
  styleUrl: './requests.component.scss',
})
export class RequestsComponent {
  // @ViewChild('pendingTable', { static: false }) pendingTable: any;
  // @ViewChild('activeTable', { static: false }) activeTable: any;
  // @ViewChild('completeTable', { static: false }) completeTable: any;

  servicesRequests: ServiceRequest[] = [];
  pendingServicesRequests: ServiceRequest[] = [];
  inProgressServicesRequests: ServiceRequest[] = [];
  completedServicesRequests: ServiceRequest[] = [];
  requests = {
    pending: true,
    active: true,
    completed: true,
  };

  // dtOptionsPending: any = {};
  // dtTriggerPending: Subject<any> = new Subject<any>();
  // dtOptionsActive: any = {};
  // dtTriggerActive: Subject<any> = new Subject<any>();
  // dtOptionsComplete: any = {};
  // dtTriggerComplete: Subject<any> = new Subject<any>();

  subscriptions: Subscription[] = [];

  constructor(
    private serviceService: ServiceService,
    private messageService: MessageService,
    private i18n: I18nService
  ) {}

  role: string | null = null;
  userId: string | null = null;
  ngOnInit() {
    // const tableOptions = {
    //   pagingType: 'full_numbers',
    //   pageLength: 10,
    //   lengthMenu: [5, 10, 15, 20, 25],
    //   responsive: true,
    // };
    // this.dtOptionsPending = tableOptions;
    // this.dtOptionsActive = tableOptions;
    // this.dtOptionsComplete = tableOptions;

    this.role = localStorage.getItem('user_role');
    this.userId = localStorage.getItem('id');
    this.getServices();
  }

  getServices() {
    console.log(this.userId);

    const getServicesRequestsByEmployeeIdSub = this.serviceService
      .getServicesRequestsByEmployeeId(this.userId!)
      .subscribe({
        next: (value) => {
          this.servicesRequests = value;
          this.pendingServicesRequests = this.servicesRequests.filter(
            (r) => r.requestStatus === 'Pending'
          );
          this.inProgressServicesRequests = this.servicesRequests.filter(
            (r) => r.requestStatus === 'In Progress'
          );
          this.completedServicesRequests = this.servicesRequests.filter(
            (r) => r.requestStatus === 'Completed'
          );
          if (this.pendingServicesRequests.length <= 0) {
            this.requests.pending = false;
          }
          if (this.inProgressServicesRequests.length <= 0) {
            this.requests.active = false;
          }
          if (this.completedServicesRequests.length <= 0) {
            this.requests.completed = false;
          }

          // const pendingTable = $(this.pendingTable?.nativeElement).DataTable();
          // const activeTable = $(this.activeTable?.nativeElement).DataTable();
          // const completeTable = $(
          //   this.completeTable?.nativeElement
          // ).DataTable();

          // if (pendingTable) {
          //   pendingTable.destroy();
          // }
          // if (activeTable) {
          //   activeTable.destroy();
          // }
          // if (completeTable) {
          //   completeTable.destroy();
          // }

          // // Trigger DataTable render
          // setTimeout(() => {
          //   this.dtTriggerPending.next(null);
          //   this.dtTriggerActive.next(null);
          //   this.dtTriggerComplete.next(null);
          // }, 0);

          console.log('Requests Loaded Successfuly');
        },
        error: (err) => {
          console.log(`Failed to Load requests: ${err}`);
        },
      });

    this.subscriptions.push(getServicesRequestsByEmployeeIdSub);
  }

  approveServiceRequest(request: ServiceRequest) {
    request.requestStatus = 'In Progress';
    const approveServiceRequestSub = this.serviceService
      .approveOrCompleteServiceRequest(request.id, request)
      .subscribe({
        next: (value) => {
          console.log('reservation approved');
          this.getServices();
          this.messageService.add({
            severity: 'success',
            summary: `${this.i18n.t('shared.toast.service-request-approved')}`,
          });
        },
        error: (err) => {
          console.log('Error approving request: ' + err);
          this.messageService.add({
            severity: 'error',
            summary: `${this.i18n.t('shared.toast.something-went-wrong')}`,
          });
        },
      });
    this.subscriptions.push(approveServiceRequestSub);
  }

  completeServiceRequest(request: ServiceRequest) {
    request.requestStatus = 'Completed';
    const completeServiceRequestSub = this.serviceService
      .approveOrCompleteServiceRequest(request.id, request)
      .subscribe({
        next: (value) => {
          console.log('reservation completed');
          this.getServices();
          this.messageService.add({
            severity: 'success',
            summary: `${this.i18n.t('shared.toast.service-request-completed')}`,
          });
        },
        error: (err) => {
          console.log('Error completing request: ' + err);
          this.messageService.add({
            severity: 'error',
            summary: `${this.i18n.t('shared.toast.something-went-wrong')}`,
          });
        },
      });
    this.subscriptions.push(completeServiceRequestSub);
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
