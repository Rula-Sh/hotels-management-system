import { Component } from '@angular/core';
import { I18nPipe } from '../../../pipes/i18n.pipe';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ConfirmationService, MessageService, PrimeIcons } from 'primeng/api';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/User.model';
import { NgbToastModule } from '@ng-bootstrap/ng-bootstrap';
import { ServiceService } from '../../../services/service.service';
import { Service } from '../../../models/Service.model';

@Component({
  selector: 'app-services',
  imports: [
    I18nPipe,
    ToastModule,
    ConfirmDialogModule,
    CommonModule,
    ButtonModule,
    NgbToastModule,
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
  constructor(
    private serviceService: ServiceService,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private authService: AuthService
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
    this.serviceService.getServicesByEmployeeId(this.userId!).subscribe({
      next: (value) => {
        this.services = value;
        console.log('Services Loaded Successfuly');
      },
      error: (err) => {
        console.log(`Failed to Load Services: ${err}`);
      },
    });
  }

  edtiService(id: string) {
    this.router.navigate([`edit-service/${id}`]);
  }

  AddService() {
    this.router.navigate([`employee/add-service`]);
  }

  deleteService(id: string) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to remove this service?',
      header: 'Remove service',
      accept: () => {
        this.serviceService.DeleteService(id).subscribe({
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
          summary: 'Service Removed',
        });
      },
      reject: () => {},
    });
  }
}
