import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home-redirect',
  imports: [HomeComponent],
  templateUrl: './home-redirect.component.html',
  styleUrl: './home-redirect.component.scss',
})
export class HomeRedirectComponent {
  role: string | null = null;

  constructor(private router: Router) {}

  ngOnInit() {
    this.role = localStorage.getItem('user_role');
    if (this.role == 'Admin') {
    this.router.navigate([`/admin/dashboard`]);
    } else if (this.role == 'Employee') {
      this.router.navigate([`/requests`]);
    } else {
      this.router.navigate([`/home`]);
    }
  }
}
