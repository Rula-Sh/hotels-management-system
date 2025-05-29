import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { I18nPipe } from '../../../pipes/i18n.pipe';
import { User } from '../../../models/User.model';
import { UserService } from '../../../services/user.service';
import { Reservation } from '../../../models/Reservation.model';
import { Service } from '../../../models/Service.model';
import { ServiceService } from '../../../services/service.service';
import { ReservationService } from '../../../services/reservation.service';
import { I18nService } from '../../../services/i18n.service';

@Component({
  selector: 'app-user-details',
  imports: [CommonModule, I18nPipe, RouterLink],
  templateUrl: './user-details.component.html',
  styleUrl: './user-details.component.scss',
})
export class UserDetailsComponent {
  user: User | undefined;
  reservations!: Reservation[];
  services!: Service[];
  isEditing = false;

  get lang(): 'en' | 'ar' {
    return this.i18nService.getLanguage();
  }

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private userService: UserService,
    private serviceService: ServiceService,
    private reservationService: ReservationService,
    private i18nService: I18nService
  ) {}

  ngOnInit() {
    this.getUser();
  }

  getUser() {
    const userId = this.activatedRoute.snapshot.paramMap.get('id');

    if (userId) {
      this.userService.getUserById(userId).subscribe({
        next: (value) => {
          this.user = value;
          console.log('User Loaded');
          this.getUserActivities(this.user.id);
        },
        error: (err) => {
          console.log('Error Retrieving the User: ' + err);
        },
      });
    } else {
      console.log('User ID is null');
    }
  }

  getUserActivities(userId: string) {
    if (this.user && this.user.role == 'Employee') {
      this.serviceService.getServicesByEmployeeId(userId).subscribe({
        next: (value) => {
          this.services = value;
          console.log('Loaded Services');
        },
        error: (err) => {
          console.log('Error Loading Services');
        },
      });
    } else {
      this.reservationService.getReservationsByCustomerId(userId).subscribe({
        next: (value) => {
          this.reservations = value;
          console.log('Loaded Reservations');
        },
        error: (err) => {
          console.log('Error Loading Reservations');
        },
      });
    }
  }
}
