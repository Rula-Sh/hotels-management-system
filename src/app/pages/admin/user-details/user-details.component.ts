import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { I18nPipe } from '../../../shared/pipes/i18n.pipe';
import { User } from '../../../shared/models/User.model';
import { UserService } from '../../../core/services/user.service';
import { Reservation } from '../../../shared/models/Reservation.model';
import { Service } from '../../../shared/models/Service.model';
import { ServiceService } from '../../../core/services/service.service';
import { ReservationService } from '../../../core/services/reservation.service';
import { I18nService } from '../../../core/services/i18n.service';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ButtonModule } from 'primeng/button';
import { forkJoin, Subscription } from 'rxjs';

@Component({
  selector: 'app-user-details',
  imports: [
    CommonModule,
    I18nPipe,
    RouterLink,
    ToastModule,
    ConfirmDialogModule,
    ButtonModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './user-details.component.html',
  styleUrl: './user-details.component.scss',
})
export class UserDetailsComponent {
  user: User | undefined;
  reservations!: Reservation[];
  services!: Service[];
  isEditing = false;

  subscriptions: Subscription[] = [];

  get lang(): 'en' | 'ar' {
    return this.i18nService.getLanguage();
  }

  constructor(
    private activatedRoute: ActivatedRoute,
    private userService: UserService,
    private serviceService: ServiceService,
    private reservationService: ReservationService,
    private i18nService: I18nService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private i18n: I18nService
  ) {}

  ngOnInit() {
    this.getUser();
  }

  getUser() {
    const userId = this.activatedRoute.snapshot.paramMap.get('id');

    if (userId) {
      const getUserByIdSub = this.userService.getUserById(userId).subscribe({
        next: (value) => {
          this.user = value;
          console.log('User Loaded');
          this.getUserActivities(this.user.id);
        },
        error: (err) => {
          console.log('Error Retrieving the User: ' + err);
        },
      });
      this.subscriptions.push(getUserByIdSub);
    } else {
      console.log('User ID is null');
    }
  }

  getUserActivities(userId: string) {
    if (this.user && this.user.role == 'Employee') {
      const getServicesByEmployeeIdSub = this.serviceService
        .getServicesByEmployeeId(userId)
        .subscribe({
          next: (value) => {
            this.services = value;
            console.log('Loaded Services');
          },
          error: (err) => {
            console.log('Error Loading Services', err);
          },
        });

      this.subscriptions.push(getServicesByEmployeeIdSub);
    } else {
      const getReservationsByCustomerIdSub = this.reservationService
        .getReservationsByCustomerId(userId)
        .subscribe({
          next: (value) => {
            this.reservations = value;
            console.log('Loaded Reservations');
          },
          error: (err) => {
            console.log('Error Loading Reservations',err);
          },
        });
      this.subscriptions.push(getReservationsByCustomerIdSub);
    }
  }

  fireEmployee(user: User) {
    this.confirmationService.confirm({
      message: `${this.i18n.t(
        'shared.confirm-dialog.confirm-fire-employee-question'
      )} ${user.name}?`,
      header: `${this.i18n.t('shared.confirm-dialog.fire-employee')}`,
      accept: () => {
        // Check for active service requests
        const getServicesRequestsByEmployeeIdSub = this.serviceService
          .getServicesRequestsByEmployeeId(user.id)
          .subscribe({
            next: (requests) => {
              const activeServices = requests.filter(
                (s) => s.requestStatus === 'In Progress'
              );

              if (activeServices.length > 0) {
                this.messageService.add({
                  severity: 'warn',
                  summary: `${this.i18n.t(
                    'shared.toast.employee-has-active-services'
                  )}`,
                  detail: `${this.i18n.t('shared.toast.cannot-fire')} ${
                    user.name
                  } `,
                });
                return;
              }

              // Get non-active services
              const getServicesByEmployeeIdSub = this.serviceService
                .getServicesByEmployeeId(user.id)
                .subscribe({
                  next: (services) => {
                    const deleteServicesObservables = services.map((s) =>
                      this.serviceService.deleteService(s.id)
                    );

                    const updateRole = () => {
                      user.role = 'Customer';
                      const updateUserDetailsSub = this.userService
                        .updateUserDetails(user)
                        .subscribe({
                          next: () => {
                            this.messageService.add({
                              severity: 'error',
                              summary: `${this.i18n.t(
                                'shared.toast.employee-fired'
                              )}`,
                            });
                          },
                          error: (err) => {
                            console.log('Error updating user role:', err);
                            this.messageService.add({
                              severity: 'error',
                              summary: `${this.i18n.t(
                                'shared.toast.something-went-wrong'
                              )}`,
                            });
                          },
                        });
                      this.subscriptions.push(updateUserDetailsSub);
                    };

                    if (deleteServicesObservables.length === 0) {
                      // No services to delete, just update role
                      updateRole();
                    } else {
                      // Subscribe to deleteServicesObservables then update role
                      const deleteServicesObservablesSub = forkJoin(
                        deleteServicesObservables
                      ).subscribe({
                        next: () => updateRole(),
                        error: (err) => {
                          console.log('Error deleting services:', err);
                          this.messageService.add({
                            severity: 'error',
                            summary: `${this.i18n.t(
                              'shared.toast.something-went-wrong'
                            )}`,
                          });
                        },
                      });
                      this.subscriptions.push(deleteServicesObservablesSub);
                    }
                  },
                  error: (err) => {
                    console.log('Error loading services:', err);
                    this.messageService.add({
                      severity: 'error',
                      summary: `${this.i18n.t(
                        'shared.toast.something-went-wrong'
                      )}`,
                    });
                  },
                });
              this.subscriptions.push(getServicesByEmployeeIdSub);
            },
            error: (err) => {
              console.log('Error loading service requests:', err);
              this.messageService.add({
                severity: 'error',
                summary: `${this.i18n.t('shared.toast.something-went-wrong')}`,
              });
            },
          });
        this.subscriptions.push(getServicesRequestsByEmployeeIdSub);
      },
      reject: () => {},
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
