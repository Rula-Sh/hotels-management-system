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
import { User } from '../../../../models/User.model';
import { AuthService } from '../../../../services/auth.service';
import { UserService } from '../../../../services/user.service';
import { NgbToastModule } from '@ng-bootstrap/ng-bootstrap';
import { I18nPipe } from '../../../../pipes/i18n.pipe';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    NgbToastModule,
    RouterModule,
    I18nPipe,
  ],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss',
})
export class SignUpComponent {
  signUpForm!: FormGroup;
  submitted = false;

  toastMessage = '';
  toastClass = '';
  showToast = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private userService: UserService
  ) {
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

    this.userService.getAllUsers().subscribe((users) => {
      const exists = users.find((u) => u.email === this.signUpForm.value.email);
      if (exists) {
        this.toastMessage = 'This email is already registered.';
        this.toastClass = 'bg-danger text-white';
        this.showToast = true;
        return;
      }

      const user: Omit<User, 'id'> = {
        name: this.signUpForm.value.name,
        email: this.signUpForm.value.email,
        phone: this.signUpForm.value.phone,
        password: btoa(this.signUpForm.value.password),
        role: 'Customer',
      };

      this.userService.CreateUser(user).subscribe({
        next: (value) => {
          this.authService.login(value);
          localStorage.setItem('user_id', value.id);

          this.toastMessage = 'Registered successfully!';
          this.toastClass = 'bg-success text-white';
          this.showToast = true;

          setTimeout(() => {
            this.router.navigate(['/']);
          }, 700);
        },
        error: (err) => {
          this.toastMessage = 'An error occurred while registering.';
          this.toastClass = 'bg-danger text-white';
          this.showToast = true;
          console.log('Error on Create', err);
        },
      });
    });
  }

  get f() {
    return this.signUpForm.controls;
  }
}
