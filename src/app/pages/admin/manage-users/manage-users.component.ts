import { Component } from '@angular/core';
import { I18nPipe } from '../../../shared/pipes/i18n.pipe';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ConfirmationService, MessageService, PrimeIcons } from 'primeng/api';
import { User } from '../../../shared/models/User.model';
import { RouterLink } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { Subject, Subscription } from 'rxjs';
import { DataTablesModule } from 'angular-datatables';

@Component({
  selector: 'app-manage-users',
  imports: [
    I18nPipe,
    ToastModule,
    ConfirmDialogModule,
    CommonModule,
    ButtonModule,
    RouterLink,
    DataTablesModule,
  ],
  providers: [MessageService, ConfirmationService, PrimeIcons],
  templateUrl: './manage-users.component.html',
  styleUrl: './manage-users.component.scss',
})
export class ManageUsersComponent {
  users: User[] = [];
  role: string | null = null;
  dtOptions: any;
  dtTrigger: Subject<any> = new Subject<any>();

  subscriptions: Subscription[] = [];

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      responsive: true,
      //   // paging:false, // to disable pages in the table
      //   // ordering:false, // to disable order by in the table
      // order: [0, 'asc'], // orders the first column in ascending order
      //   // lengthChange: false, // disables selecting the lengthMenu
      //   // scrollY: '400, // to add scroll to the datatable
      //   // language: {
      //   //   searchPlaceholder: 'Search...',
      //   // },
    };

    this.getUsers();
    this.role = localStorage.getItem('user_role');
  }

  getUsers() {
    const getAllUsersSub = this.userService.getAllUsers().subscribe({
      next: (value) => {
        this.users = value;
        this.dtTrigger.next(null);
        console.log('users Loaded Successfuly');
      },
      error: (err) => {
        console.log(`Failed to Load users: ${err}`);
      },
    });
    this.subscriptions.push(getAllUsersSub);
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.dtTrigger.unsubscribe();
  }
}
