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
import { UserService } from '../../../services/user.service';
import { Router, RouterLink } from '@angular/router';
import { I18nService } from '../../../services/i18n.service';
import { Employee, jobTitlesByCategory } from '../../../models/Employee.model';

import { SearchCountryField, CountryISO } from 'ngx-intl-tel-input';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-add-employee',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    I18nPipe,
    RouterLink,
    NgxIntlTelInputModule,
  ],
  templateUrl: './add-employee.component.html',
  styleUrl: './add-employee.component.scss',
})
export class AddEmployeeComponent {
  user: User | null = null;
  profileForm!: FormGroup;
  jobCategories: string[] = [];
  jobTitles: readonly string[] = [];

  SearchCountryField = SearchCountryField;
  CountryISO = CountryISO;
  preferredCountries: CountryISO[] = [CountryISO.Jordan];

  subscriptions: Subscription[] = [];

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
      phone: [undefined, Validators.required],
      jobCategory: ['', Validators.required],
      jobTitle: ['', Validators.required],
      hotel: [
        '',
        [
          Validators.required,
          Validators.maxLength(2),
          Validators.maxLength(30),
          Validators.pattern(/^[a-zA-Z0-9'\-$!& ]+$/),
        ],
      ],
      newPassword: [
        '',
        [
          Validators.minLength(6),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/), // at least one lowercase, uppercase, digit, special char
        ],
      ],
      confirmPassword: [
        '',
        [
          Validators.minLength(6),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/),
        ],
      ],
    });

    this.jobCategories = Object.keys(jobTitlesByCategory);

    const jobCategoryControl = this.profileForm.get('jobCategory'); // had to do this so that i can add onJobCategoryChangeSub to subscriptions... it caused the error "Argument of type 'Subscription | undefined'  not assignable to parameter of type 'Subscription'"
    if (jobCategoryControl) {
      const onJobCategoryChangeSub = jobCategoryControl.valueChanges.subscribe(
        (selectedCategory: string) => {
          this.jobTitles =
            jobTitlesByCategory[
              selectedCategory as keyof typeof jobTitlesByCategory
            ] ?? [];
          this.profileForm.get('jobTitle')?.setValue('');
        }
      );
      this.subscriptions.push(onJobCategoryChangeSub);
    }
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
      phone: this.profileForm.value.phone.internationalNumber,
      hotel: this.profileForm.value.hotel,
      jobCategory: this.profileForm.value.jobCategory,
      jobTitle: this.profileForm.value.jobTitle,
      password: this.profileForm.value.newPassword,
      role: 'Employee',
    };

    console.log(newEmployee);

    const addEmployeeSub = this.userService.createUser(newEmployee).subscribe({
      next: () => {
        console.log('Employee added successfully');
        this.router.navigate(['/']);
        this.profileForm.reset();
      },
      error: (err) => {
        console.log('Error on Adding an Employee', err);
      },
    });
    this.subscriptions.push(addEmployeeSub);
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
