import { Component, ChangeDetectorRef, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { I18nPipe } from '../../../pipes/i18n.pipe';
import { I18nService } from '../../../../core/services/i18n.service';
import { Reservation } from '../../../models/Reservation.model';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-header',
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterModule,
    CommonModule,
    I18nPipe,
    CommonModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  standalone: true,
})
export class HeaderComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  private subscription!: Subscription;
  userId: string | null = null;
  name: string | null = null;
  role: string | null = null;
  pfp: string | null = null;
  isMenuOpen = false;
  reservations: Reservation[] = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    private i18nService: I18nService,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService
  ) {}

  get lang(): 'en' | 'ar' {
    return this.i18nService.getLanguage();
  }

  ngOnInit() {
    this.subscription = this.authService.isLoggedIn$.subscribe((status) => {
      this.isLoggedIn = status;
      this.cdr.detectChanges();
    });
    this.userId = localStorage.getItem('id');
    this.name = localStorage.getItem('name');
    this.role = localStorage.getItem('user_role');
    this.pfp = localStorage.getItem('pfp');
  }

  ngDoCheck() {
    this.userId = localStorage.getItem('id');
    this.name = localStorage.getItem('name');
    this.role = localStorage.getItem('user_role');
    this.pfp = localStorage.getItem('pfp');
  }

  goToAvailableServices(event: Event) {
    event.preventDefault(); // يمنع الانتقال التلقائي بالرابط

    // تحققي من وجود حجز Approved
    const hasBookedRoom = this.reservations.some(
      (res) => res.approvalStatus === 'Approved'
    );

    if (hasBookedRoom) {
      this.router.navigate(['/available-services']);
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: this.i18nService.t('shared.toast.no-booked-room-title'),
        detail: this.i18nService.t('shared.toast.no-booked-room-message'),
      });
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
