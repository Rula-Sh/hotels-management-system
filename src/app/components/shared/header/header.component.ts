import { Component, ChangeDetectorRef, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, RouterModule, CommonModule, I18nPipe, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  standalone: true
})
export class HeaderComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  private subscription!: Subscription;

  constructor(private authService: AuthService, private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.subscription = this.authService.isLoggedIn$.subscribe(status => {
      this.isLoggedIn = status;
      this.cdr.detectChanges();
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  goToProfile(id: string) {
    this.router.navigate([`profile/${id}`]);

  ngOnDestroy() {
    this.subscription.unsubscribe();
    
      userId: string | null = null;
  name: string | null = null;
  role: string | null = null;

//   ngOnInit() {
//     this.userId = localStorage.getItem('id');
//     this.name = localStorage.getItem('name');
//     this.role = localStorage.getItem('user_role');
//   }

//   ngDoCheck() {
//     this.userId = localStorage.getItem('id');
//     this.name = localStorage.getItem('username');
//     this.role = localStorage.getItem('user_role');
//   }
