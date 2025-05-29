import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { I18nPipe } from '../../../pipes/i18n.pipe';
import { User } from '../../../models/User.model';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { Router, RouterLink } from '@angular/router';
import { I18nService } from '../../../services/i18n.service';
import { Employee } from '../../../models/Employee.model';

@Component({
  selector: 'app-add-employee',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    I18nPipe,
    RouterLink,
  ],
  templateUrl: './add-employee.component.html',
  styleUrl: './add-employee.component.scss',
})
export class AddEmployeeComponent {
  user: User | null = null;
  profileForm!: FormGroup;

  get lang(): 'en' | 'ar' {
    return this.i18nService.getLanguage();
  }

  constructor(
    private userService: UserService,
    private router: Router,
    private fb: FormBuilder,
    private i18nService: I18nService
  ) {}

  ngOnInit() {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [
        '',
        [
          Validators.required,
          Validators.pattern(/^079 \d{3} \d{4}$/),
          Validators.maxLength(13),
        ],
      ],
      jobTitle: ['', Validators.required],
      hotel: ['', Validators.required],
      newPassword: ['', Validators.minLength(6)],
      confirmPassword: ['', Validators.minLength(6)],
    });
  }

  addEmployee() {
    if (this.profileForm.invalid) {
      console.log(this.profileForm.invalid);

      return this.profileForm.markAllAsTouched();
    }

    if (
      this.profileForm.value.newPassword ===
        this.profileForm.value.confirmPassword &&
      this.profileForm.value.newPassword.trim() !== ''
    ) {
      this.profileForm.value.newPassword = btoa(
        this.profileForm.value.newPassword
      );
    }

    const newEmployee: Omit<Employee, 'id'> = {
      name: this.profileForm.value.name,
      email: this.profileForm.value.email,
      phone: this.profileForm.value.phone,
      hotel: this.profileForm.value.hotel,
      jobTitle: this.profileForm.value.jobTitle,
      password: this.profileForm.value.newPassword,
      role: 'Employee',
    };

    console.log(newEmployee);

    this.userService.AddEmployee(newEmployee).subscribe({
      next: () => {
        console.log('Employee added successfully');
        this.router.navigate(['/']);
        this.profileForm.reset();
      },
      error: (err) => {
        console.log('Error on Adding an Employee', err);
      },
    });
  }
}
