import { Component } from '@angular/core';
import { I18nPipe } from '../../../shared/pipes/i18n.pipe';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ConfirmationService, MessageService, PrimeIcons } from 'primeng/api';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../shared/models/User.model';
import { ServiceService } from '../../../core/services/service.service';
import { Service } from '../../../shared/models/Service.model';
import { I18nService } from '../../../core/services/i18n.service';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-services',
  imports: [
    I18nPipe,
    ToastModule,
    ConfirmDialogModule,
    CommonModule,
    ButtonModule,
    RouterLink,
    FormsModule,
  ],
  providers: [MessageService, ConfirmationService, PrimeIcons],
  templateUrl: './services.component.html',
  styleUrl: './services.component.scss',
})
export class ServicesComponent {
  services: Service[] = [];
  user: User | null = null;

  searchInput: string = '';
  sortBy: 'title' | 'type' | 'price' | '' = '';
  filteredServices: Service[] = [];
  sortDirection: 'Ascending' | 'Descending' = 'Ascending';

  subscriptions: Subscription[] = [];

  get lang(): 'en' | 'ar' {
    return this.i18nService.getLanguage();
  }

  constructor(
    private serviceService: ServiceService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private authService: AuthService,
    private i18nService: I18nService
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
          this.applyFilters();
          console.log('Services Loaded Successfuly');
        },
        error: (err) => {
          console.log(`Failed to Load Services: ${err}`);
        },
      });
    this.subscriptions.push(getServicesByEmployeeIdSub);
  }

  applyFilters() {
    this.filteredServices = this.services
      .filter((service) =>
        service.title.toLowerCase().includes(this.searchInput.toLowerCase())
      )
      .sort((a, b) => {
        let result = 0;

        if (this.sortBy === 'title') {
          result = a.title.localeCompare(b.title);
        } else if (this.sortBy === 'type') {
          result = a.serviceType.localeCompare(b.serviceType);
        } else if (this.sortBy === 'price') {
          result = a.price - b.price;
        }

        return this.sortDirection === 'Ascending' ? result : -result;
      });
  }

  onSearchChange() {
    this.applyFilters();
  }

  onSortChange(value: string) {
    this.sortBy = value as 'title' | 'type' | 'price';
    this.applyFilters();
  }

  toggleSortDirection() {
    this.sortDirection =
      this.sortDirection === 'Ascending' ? 'Descending' : 'Ascending';
    this.applyFilters();
  }

  deleteService(id: string) {
    this.confirmationService.confirm({
      message: `${this.i18nService.t(
        'shared.confirm-dialog.confirm-remove-service-question'
      )}`,
      header: `${this.i18nService.t('shared.confirm-dialog.remove-service')}`,
      accept: () => {
        const deleteServiceSub = this.serviceService
          .deleteService(id)
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
          summary: `${this.i18nService.t('shared.toast.something-went-wrong')}`,
        });
        this.subscriptions.push(deleteServiceSub);
      },
      reject: () => {},
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
