import { Component } from '@angular/core';
import { I18nPipe } from '../../../pipes/i18n.pipe';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ConfirmationService, MessageService, PrimeIcons } from 'primeng/api';
import { User } from '../../../models/User.model';
import { Router } from '@angular/router';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-manage-users',
  imports: [
    I18nPipe,
    ToastModule,
    ConfirmDialogModule,
    CommonModule,
    ButtonModule,
  ],
  providers: [MessageService, ConfirmationService, PrimeIcons],
  templateUrl: './manage-users.component.html',
  styleUrl: './manage-users.component.scss',
})
export class ManageUsersComponent {
  users: User[] = [
    {
      id: '',
      name: '',
      email: '',
      password: '',
      phone: '',
      role: 'customer',
    },
  ];

  constructor(
    private userService: UserService,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  role: string | null = null;
  ngOnInit() {
    this.getUsers();
    this.role = localStorage.getItem('user_role');
  }

  AddEmployee() {
    this.router.navigate(['/admin/add-employee']);
  }

  getUsers() {
    this.userService.getAllUsers().subscribe({
      next: (value) => {
        this.users = value;
        console.log('users Loaded Successfuly');
      },
      error: (err) => {
        console.log(`Failed to Load users: ${err}`);
      },
    });
  }
  ShowUserProfile(id: string) {
    this.router.navigate([`user/${id}`]);
  }

  HireUser(id: string, user: User) {
    this.userService.UpdateUserDetails(user).subscribe({
      next: (value) => {
        console.log('user hired');
        this.getUsers();
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'User has been hired',
        });
      },
      error: (err) => {
        console.log('Error hiring user: ' + err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed hire user',
        });
      },
    });
  }

  FireEmployee(id: string, user: User) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to reject this reservation?',
      header: 'Reject Reservation',
      accept: () => {
        this.userService.UpdateUserDetails(user).subscribe({
          next: (value) => {
            console.log('Reservation rejected');
            this.getUsers();
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
