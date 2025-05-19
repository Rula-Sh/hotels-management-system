import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { I18nPipe } from '../../../pipes/i18n.pipe';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-header',
  imports: [I18nPipe, RouterModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  userId: string | null = null;
  name: string | null = null;
  role: string | null = null;

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {
    this.userId = localStorage.getItem('id');
    this.name = localStorage.getItem('name');
    this.role = localStorage.getItem('user_role');
  }

  ngDoCheck() {
    this.userId = localStorage.getItem('id');
    this.name = localStorage.getItem('username');
    this.role = localStorage.getItem('user_role');
  }

  logout() {
    this.authService.logout();
    this.router.navigate([`/`]);
  }

  goToProfile(id: string) {
    this.router.navigate([`profile/${id}`]);
  }
}
