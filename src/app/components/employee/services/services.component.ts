import { Component } from '@angular/core';
import { I18nPipe } from '../../../pipes/i18n.pipe';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ConfirmationService, MessageService, PrimeIcons } from 'primeng/api';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/User.model';
import { NgbToastModule } from '@ng-bootstrap/ng-bootstrap';
import { ServiceService } from '../../../services/service.service';
import { Service } from '../../../models/Service.model';
import { I18nService } from '../../../services/i18n.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-services',
  imports: [
    I18nPipe,
    ToastModule,
    ConfirmDialogModule,
    CommonModule,
    ButtonModule,
    NgbToastModule,
    RouterLink,
  ],
  providers: [MessageService, ConfirmationService, PrimeIcons],
  templateUrl: './services.component.html',
  styleUrl: './services.component.scss',
})
export class ServicesComponent {
  showToast = false;
  toastMessage = '';
  toastHeader = '';
  toastClass = '';
  services: Service[] = [];
  user: User | null = null;

  subscriptions: Subscription[] = [];

  constructor(
    private serviceService: ServiceService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private authService: AuthService,
    private i18n: I18nService
  ) {}

  userId: string | null = null;
  ngOnInit() {
    this.userId = localStorage.getItem('id');
    if (this.authService) {
      try {
        this.user = this.authService.getCurrentUser();
      } catch {
        this.user = null;
      }
    }
    this.getServices();
  }

  getServices() {
    const getServicesByEmployeeIdSub = this.serviceService
      .getServicesByEmployeeId(this.userId!)
      .subscribe({
        next: (value) => {
          this.services = value;
          console.log('Services Loaded Successfuly');
        },
        error: (err) => {
          console.log(`Failed to Load Services: ${err}`);
        },
      });
    this.subscriptions.push(getServicesByEmployeeIdSub);
  }

  deleteService(id: string) {
    this.confirmationService.confirm({
      message: `${this.i18n.t(
        'shared.confirm-dialog.confirm-remove-service-question'
      )}`,
      header: `${this.i18n.t('shared.confirm-dialog.remove-service')}`,
      accept: () => {
        const DeleteServiceSub = this.serviceService
          .DeleteService(id)
          .subscribe({
            next: (value) => {
              console.log('Service deleted');
              this.getServices();
            },
            error(err) {
              console.log('Error deleting service: ' + err);
            },
          });
        this.messageService.add({
          severity: 'error',
          summary: `${this.i18n.t('shared.toast.something-went-wrong')}`,
        });
        this.subscriptions.push(DeleteServiceSub);
      },
      reject: () => {},
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
