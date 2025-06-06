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
import { UserService } from '../../../../services/user.service';
import { AuthService } from '../../../../services/auth.service';
import { I18nPipe } from '../../../../pipes/i18n.pipe';
import { Subscription } from 'rxjs';
import { MessageService } from 'primeng/api';
import { I18nService } from '../../../../services/i18n.service';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterLink,
    I18nPipe,
    ToastModule,
  ],
  providers:[MessageService],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  loginForm!: FormGroup;
  submitted = false;

  subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private userService: UserService,
    private authService: AuthService,
    private messageService: MessageService,
    private i18nService: I18nService
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

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const email = this.loginForm.value.email;
    const password = btoa(this.loginForm.value.password);

    const getAllUsersSub = this.userService.getAllUsers().subscribe((users) => {
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
      this.messageService.add({
        severity: 'success',
        summary: `${this.i18nService.t('shared.toast.login-successful')}`,
      });
      this.authService.login(userByEmail);
      localStorage.setItem('id', userByEmail.id.toString());
    });
    this.subscriptions.push(getAllUsersSub);
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
