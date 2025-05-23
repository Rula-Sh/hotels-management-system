import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from '../models/User.model';

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
    this.loggedInSubject.next(true);
  }

  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('id');
    localStorage.removeItem('name');
    localStorage.removeItem('email');
    localStorage.removeItem('user_role');
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
