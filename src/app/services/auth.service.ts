import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from '../models/User.model';
import { Employee } from '../models/Employee.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private loggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  isLoggedIn$ = this.loggedInSubject.asObservable();

  private redirectUrl = '';

  constructor() {}

  private hasToken(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  login(user: User) {
    const mockToken = 'mock-token';
    localStorage.setItem('auth_token', mockToken);
    localStorage.setItem('id', user.id);
    localStorage.setItem('name', user.name);
    localStorage.setItem('email', user.email);
    localStorage.setItem('user_role', user.role);
    localStorage.setItem('pfp', user.pfp ?? '');

    if (user.role === 'Employee') {
      const employee = user as Employee;
      localStorage.setItem('hotel', employee.hotel);
      localStorage.setItem('jobTitle', employee.jobTitle);
    }
    this.loggedInSubject.next(true);
  }

  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('id');
    localStorage.removeItem('name');
    localStorage.removeItem('email');
    localStorage.removeItem('user_role');
    localStorage.removeItem('pfp');
    this.loggedInSubject.next(false);
  }

  isLoggedIn(): boolean {
    return this.hasToken();
  }

  getCurrentUser(): User | null {
    const id = localStorage.getItem('id');
    const name = localStorage.getItem('name');
    const email = localStorage.getItem('email');
    const role = localStorage.getItem('user_role');
    if (name && email && role) {
      const user: User = { id, name, email, role } as User;
      return user;
    }
    return null;
  }

  getCurrentEmployee(): Employee | null {
    const user = this.getCurrentUser();
    const hotel = localStorage.getItem('hotel');
    const jobTitle = localStorage.getItem('jobTitle');

    if (user && hotel && jobTitle) {
      return {
        ...user,
        hotel,
        jobTitle,
      } as Employee;
    }

    return null;
  }

  setRedirectUrl(url: string) {
    this.redirectUrl = url;
  }

  getRedirectURL(): string | null {
    return this.redirectUrl;
  }

  getUserRole(): string | null {
    return localStorage.getItem('user_role');
  }
}
