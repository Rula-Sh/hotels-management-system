import { Component, ChangeDetectorRef, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { I18nPipe } from '../../../pipes/i18n.pipe';
import { I18nService } from '../../../../core/services/i18n.service';

@Component({
  selector: 'app-header',
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterModule,
    CommonModule,
    I18nPipe,
    CommonModule,
  ],
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

  constructor(
    private authService: AuthService,
    private router: Router,
    private i18nService: I18nService,
    private cdr: ChangeDetectorRef
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

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
