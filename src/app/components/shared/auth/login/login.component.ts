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
import { I18nPipe } from '../../../../pipes/i18n.pipe';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgbToastModule,
    RouterLink,
    I18nPipe,
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
      email: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.pattern(
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
          ),
        ],
      ],
      password: ['', Validators.required],
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  onSubmit() {
    this.submitted = true;
    this.showToast = false;

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const email = this.loginForm.value.email;
    const password = btoa(this.loginForm.value.password);

    this.userService.getAllUsers().subscribe((users) => {
      const userByEmail = users.find((u) => u.email === email);

      // If email is not found
      if (!userByEmail) {
        this.loginForm.controls['email'].setErrors({ emailNotFound: true });
        return;
      }

      // If password is incorrect
      if (userByEmail.password !== password) {
        this.loginForm.controls['password'].setErrors({
          invalidPassword: true,
        });
        return;
      }

      this.authService.login(userByEmail);
      this.toastMessage = 'Login successful!';
      this.toastClass = 'bg-success text-white';
      this.showToast = true;
      this.authService.login(userByEmail);
      localStorage.setItem('id', userByEmail.id.toString());
      setTimeout(() => {
        this.showToast = false;
        this.router.navigate(['/']);
      }, 1500);
    });
  }
}
