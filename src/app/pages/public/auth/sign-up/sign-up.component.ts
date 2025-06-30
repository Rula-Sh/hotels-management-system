import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { User } from '../../../models/User.model';
import { AuthService } from '../../../../core/services/auth.service';
import { UserService } from '../../../../core/services/user.service';
import { I18nPipe } from '../../../pipes/i18n.pipe';
import { Subscription } from 'rxjs';
import { MessageService } from 'primeng/api';
import { I18nService } from '../../../../core/services/i18n.service';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    RouterModule,
    I18nPipe,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss',
})
export class SignUpComponent {
  signUpForm!: FormGroup;
  submitted = false;

  subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
    private messageService: MessageService,
    private i18nService: I18nService
  ) {}

  ngOnInit() {
    this.signUpForm = this.fb.group(
      {
        name: [
          '',
          [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(20),
            Validators.pattern(/^[\u0600-\u06FFa-zA-Z'\s]+$/),
          ],
        ],
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
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(6),
            Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/), // at least one lowercase, uppercase, digit, special char
          ],
        ],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordsMatchValidator }
    );
  }

  // Custom validator
  passwordsMatchValidator(form: AbstractControl): ValidationErrors | null {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  onSubmit() {
    this.submitted = true;

    if (this.signUpForm.invalid) {
      this.signUpForm.markAllAsTouched();
      return;
    }

    const getAllUsersSub = this.userService.getAllUsers().subscribe((users) => {
      const exists = users.find((u) => u.email === this.signUpForm.value.email);
      if (exists) {
        this.messageService.add({
          severity: 'error',
          summary: `${this.i18nService.t('shared.toast.email-already-exists')}`,
        });
        return;
      }

      const user: Omit<User, 'id'> = {
        name: this.signUpForm.value.name,
        email: this.signUpForm.value.email,
        phone: this.signUpForm.value.phone,
        password: btoa(this.signUpForm.value.password),
        role: 'Customer',
      };

      const createUserSub = this.userService.createUser(user).subscribe({
        next: (value) => {
          this.authService.login(value);
          localStorage.setItem('id', value.id);

          this.messageService.add({
            severity: 'success',
            summary: `${this.i18nService.t(
              'shared.toast.registered-successfully'
            )}`,
          });
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 700);
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: `${this.i18nService.t(
              'shared.toast.something-went-wrong'
            )}`,
          });
          console.log('Error on Create', err);
        },
      });
      this.subscriptions.push(createUserSub);
    });
    this.subscriptions.push(getAllUsersSub);
  }

  get f() {
    return this.signUpForm.controls;
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
