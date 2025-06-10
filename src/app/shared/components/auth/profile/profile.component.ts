import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { User } from '../../../models/User.model';
import { AuthService } from '../../../../core/services/auth.service';
import { UserService } from '../../../../core/services/user.service';
import { I18nService } from '../../../../core/services/i18n.service';
import { MessageService } from 'primeng/api';
import { UploadService } from '../../../../core/services/upload.service';

import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import {
  SearchCountryField,
  CountryISO,
  PhoneNumberFormat,
} from 'ngx-intl-tel-input';
import { CommonModule } from '@angular/common';
import { I18nPipe } from '../../../pipes/i18n.pipe';
import { ToastModule } from 'primeng/toast';
import { Employee } from '../../../models/Employee.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  providers: [MessageService],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    I18nPipe,
    ToastModule,
    NgxIntlTelInputModule,
  ],
})
export class ProfileComponent {
  user: User | Employee | null = null;
  profileForm!: FormGroup;
  phoneForm!: FormGroup;
  isEditingPhone = false;
  isEditing = false;
  profileData: any;
  isChangingPass = false;

  selectedFile: File | null = null;
  uploadPreset = 'HMS - IIH Project';
  imageUrl: string | null = null;

  SearchCountryField = SearchCountryField;
  CountryISO = CountryISO;
  PhoneNumberFormat = PhoneNumberFormat;
  preferredCountries: CountryISO[] = [CountryISO.Jordan];

  subscriptions: Subscription[] = [];

  get lang(): 'en' | 'ar' {
    return this.i18nService.getLanguage();
  }

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private fb: FormBuilder,
    private i18nService: I18nService,
    private messageService: MessageService,
    private uploadService: UploadService,
    private i18n: I18nService
  ) {}

  ngOnInit() {
    this.user = this.authService.getCurrentUser();
    if (this.user?.role == 'Employee') {
      this.user = this.authService.getCurrentEmployee();
    }
    this.imageUrl = localStorage.getItem('pfp');

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
      phone: [undefined],
      password: [''],
      imageUrl: [''],
      newPassword: [
        '',
        [
          Validators.minLength(6),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/), // at least one lowercase, uppercase, digit, special char
        ],
      ],
      confirmPassword: ['', Validators.minLength(6)],
    });

    this.phoneForm = this.fb.group({
      phone: [undefined, Validators.required],
    });

    this.loadProfile();
  }

  loadProfile() {
    this.profileData = {
      name: this.user?.name,
      email: this.user?.email,
      phone: this.user?.phone,
    };

    this.profileForm.patchValue({
      name: this.profileData.name,
      email: this.profileData.email,
      phone: this.profileData.phone.substring(4).trim(),
      imageUrl: this.imageUrl ?? '',
    });

    this.phoneForm.patchValue({
      phone: this.profileData.phone.substring(4).trim(),
    });
    // i can use mark all as touched to validate the data once it is loaded
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    const control = this.profileForm.get('imageUrl');

    if (!file) {
      control?.setErrors({ required: true });
      control?.markAsTouched();
      return;
    }

    const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/gif'];
    const maxSizeInBytes = 2 * 1024 * 1024; // 2MB

    if (!allowedTypes.includes(file.type)) {
      control?.setErrors({ invalidType: true });
      control?.markAsTouched();
      return;
    }

    if (file.size > maxSizeInBytes) {
      control?.setErrors({ maxSizeExceeded: true });
      control?.markAsTouched();
      return;
    }

    control?.setErrors(null);
    control?.markAsTouched();

    const reader = new FileReader();
    reader.onload = () => {
      control?.setValue(reader.result);
    };
    reader.readAsDataURL(file);

    this.selectedFile = file;
    if (!this.selectedFile) return;

    const uploadImageSub = this.uploadService
      .uploadImage(this.selectedFile, this.uploadPreset)
      .subscribe({
        next: (res: any) => {
          this.imageUrl = res.url;
          this.profileForm.get('imageUrl')?.setValue(this.imageUrl);

          this.updateProfile(); // تحديث الملف الشخصي مباشرة بعد رفع الصورة
        },
        error: (err) => {
          console.error('Error uploading image:', err);
          this.messageService.add({
            severity: 'error',
            summary: this.i18nService.t('shared.toast.failed-to-upload-image'),
          });
        },
      });

    this.subscriptions.push(uploadImageSub);
  }

  updateProfile() {
    if (!this.user) return;

    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const getUserByIdSub = this.userService
      .getUserById(this.user.id)
      .subscribe((fullUser) => {
        let password = fullUser.password;

        if (
          this.isChangingPass &&
          this.profileForm.value.newPassword ===
            this.profileForm.value.confirmPassword &&
          this.profileForm.value.newPassword.trim() !== ''
        ) {
          password = btoa(this.profileForm.value.newPassword);
        } else {
          this.profileForm.value.phone = this.profileForm.value.phone ?? '';

          if (
            this.profileForm.value.name == this.profileData.name &&
            this.profileForm.value.email == this.profileData.email &&
            this.profileForm.value.phone ==
              this.profileData.phone.substring(4).trim()
          ) {
            this.messageService.add({
              severity: 'warn',
              summary: `${this.i18n.t('shared.toast.no-new-data-to-update')}`,
            });
            return;
          }
        }

        if (this.user?.role == 'Employee') {
          const fullEmployee = fullUser as Employee;
          const updatedEmployee: Employee = {
            id: fullEmployee.id,
            name: this.profileForm.value.name,
            email: this.profileForm.value.email,
            phone: this.profileForm.value.phone?.internationalNumber ?? '',
            password: password,
            pfp: this.imageUrl ?? '',
            role: fullEmployee.role,
            hotel: fullEmployee.hotel,
            jobCategory: fullEmployee.jobCategory,
            jobTitle: fullEmployee.jobTitle,
          };

          const updateEmployeeSub = this.userService
            .updateEmployee(updatedEmployee)
            .subscribe({
              next: () => this.handleSuccess(updatedEmployee),
              error: (err) => this.handleError(err),
            });
          this.subscriptions.push(updateEmployeeSub);
        } else {
          var updatedUser: User = {
            id: this.user!.id,
            name: this.profileForm.value.name,
            email: this.profileForm.value.email,
            phone: this.profileForm.value.phone?.internationalNumber ?? '',
            password: password,
            pfp: this.imageUrl ?? '',
            role: this.user!.role,
          };

          const updateUserDetailsSub = this.userService
            .updateUserDetails(updatedUser)
            .subscribe({
              next: () => this.handleSuccess(updatedUser),
              error: (err) => this.handleError(err),
            });
          this.subscriptions.push(updateUserDetailsSub);
        }
      });

    this.subscriptions.push(getUserByIdSub);
  }
  private handleSuccess(updatedUser: User | Employee) {
    console.log('Form Submitted');
    this.authService.login(updatedUser);
    this.messageService.add({
      severity: 'success',
      summary: `${this.i18n.t('shared.toast.profile-updated-successfully')}`,
    });

    setTimeout(() => {
      this.router.navigate(['/profile/' + this.user?.id]);
      this.isEditing = false;
      this.isChangingPass = false;
      this.user = this.authService.getCurrentUser();
      this.loadProfile();
      this.profileForm.get('password')?.setValue('');
      this.profileForm.get('newPassword')?.setValue('');
    }, 1500);
  }

  private handleError(err: any) {
    console.log('Error on Update', err);
    this.messageService.add({
      severity: 'error',
      summary: `${this.i18n.t('shared.toast.something-went-wrong')}`,
    });
  }

  updatePhoneOnly() {
    if (this.phoneForm.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: this.i18nService.t('shared.toast.error'),
        detail: this.i18nService.t('shared.toast.invalid-phone-number'),
      });
      return;
    }

    const newPhone =
      this.phoneForm.value.phone.internationalNumber ??
      this.phoneForm.value.phone;

    if (!this.user) return;

    const updatePhoneSub = this.userService
      .updatePhone(this.user.id, newPhone)
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: this.i18nService.t('shared.toast.success'),
            detail: this.i18nService.t('shared.toast.phone-number-updated'),
          });
          if (this.user) this.user.phone = newPhone;
          this.isEditingPhone = false;
          this.loadProfile();
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: this.i18nService.t('shared.toast.error'),
            detail: this.i18nService.t('shared.toast.failed-to-update-phone'),
          });
        },
      });

    this.subscriptions.push(updatePhoneSub);
  }

  edit() {
    this.isEditing = true;
  }

  cancel() {
    this.isEditing = false;
    this.loadProfile();
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
