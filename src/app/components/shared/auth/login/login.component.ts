import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgbToastModule } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from '../../../../services/user.service';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgbToastModule,
    RouterLink,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  loginForm!: FormGroup;
  submitted = false;
  showToast = false;
  toastMessage = '';
  toastHeader = '';
  toastClass = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private userService: UserService,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  onSubmit() {
    this.submitted = true;
    this.showToast = false;

    if (this.loginForm.invalid) return;

    const email = this.loginForm.value.email;
    const password = btoa(this.loginForm.value.password);

    this.userService.getAllUsers().subscribe((users) => {
      const user = users.find(
        (u) => u.email === email && u.password === password
      );

      if (!user) {
        this.toastMessage = 'Invalid email or password.';
        this.toastClass = 'bg-danger text-white';
        this.showToast = true;

        setTimeout(() => {
          this.showToast = false;
        }, 3000);

        return;
      }

      this.authService.login(user);
      this.toastMessage = 'Login successful!';
      this.toastClass = 'bg-success text-white';
      this.showToast = true;
      this.authService.login(user);
      localStorage.setItem('id', user.id.toString());
      setTimeout(() => {
        this.showToast = false;
        this.router.navigate(['/']);
      }, 1500);
    });
  }
}
