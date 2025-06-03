import { Component } from '@angular/core';
import { ConfirmationService, MessageService, PrimeIcons } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { I18nPipe } from '../../../pipes/i18n.pipe';
import { ServiceService } from '../../../services/service.service';
import { ServiceRequest } from '../../../models/ServiceRequest.model';
import { I18nService } from '../../../services/i18n.service';

@Component({
  selector: 'app-requests',
  imports: [
    I18nPipe,
    ToastModule,
    ConfirmDialogModule,
    CommonModule,
    ButtonModule,
  ],
  providers: [MessageService, ConfirmationService, PrimeIcons],
  templateUrl: './requests.component.html',
  styleUrl: './requests.component.scss',
})
export class RequestsComponent {
  servicesRequests: ServiceRequest[] = [];
  pendingServicesRequests: ServiceRequest[] = [];
  inProgressServicesRequests: ServiceRequest[] = [];
  completedServicesRequests: ServiceRequest[] = [];
  requests = {
    pending: true,
    active: true,
    completed: true,
  };
  constructor(
    private serviceService: ServiceService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private i18n: I18nService
  ) {}

  role: string | null = null;
  userId: string | null = null;
  ngOnInit() {
    this.role = localStorage.getItem('user_role');
    this.userId = localStorage.getItem('id');
    this.getServices();
  }

  getServices() {
    console.log(this.userId);

    this.serviceService
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
          console.log('Requests Loaded Successfuly');
        },
        error: (err) => {
          console.log(`Failed to Load requests: ${err}`);
        },
      });
  }

  ApproveServiceRequest(id: string, request: ServiceRequest) {
    request.requestStatus = 'In Progress';
    this.serviceService.ApproveServicesRequest(id, request).subscribe({
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
  }

  CompleteServiceRequest(id: string, request: ServiceRequest) {
    request.requestStatus = 'Completed';
    this.serviceService.ApproveServicesRequest(id, request).subscribe({
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
  }
}
