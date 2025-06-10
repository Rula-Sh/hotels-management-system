import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from '../../shared/models/User.model';
import { Employee } from '../../shared/models/Employee.model';

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
    localStorage.setItem('phone', user.phone ?? '');
    localStorage.setItem('pfp', user.pfp ?? '');

    if (user.role === 'Employee') {
      const employee = user as Employee;
      localStorage.setItem('hotel', employee.hotel);
      localStorage.setItem('jobTitle', employee.jobTitle);
      localStorage.setItem('jobCategory', employee.jobCategory);
    }
    this.loggedInSubject.next(true);
  }

  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('id');
    localStorage.removeItem('name');
    localStorage.removeItem('email');
    localStorage.removeItem('user_role');
    localStorage.removeItem('phone');
    localStorage.removeItem('pfp');


    localStorage.removeItem('hotel');
    localStorage.removeItem('jobTitle');
    localStorage.removeItem('jobCategory');
    
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
    const phone = localStorage.getItem('phone');
    const pfp = localStorage.getItem('pfp');
    if (name && email && role) {
      const user: User = { id, name, email, phone, role, pfp } as User;
      return user;
    }
    return null;
  }

  getCurrentEmployee(): Employee | null {
    const user = this.getCurrentUser();
    const hotel = localStorage.getItem('hotel');
    const jobTitle = localStorage.getItem('jobTitle');
    const jobCategory = localStorage.getItem('jobCategory');

    if (user && hotel && jobTitle) {
      return {
        ...user,
        hotel,
        jobTitle,
        jobCategory,
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
