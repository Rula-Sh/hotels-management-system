import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { I18nPipe } from '../../../../pipes/i18n.pipe';
import { User } from '../../../../models/User.model';
import { AuthService } from '../../../../services/auth.service';
import { UserService } from '../../../../services/user.service';
import { I18nService } from '../../../../services/i18n.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

import { SearchCountryField, CountryISO } from 'ngx-intl-tel-input';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { UploadService } from '../../../../services/upload.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    I18nPipe,
    ToastModule,
    NgxIntlTelInputModule,
  ],
  providers: [MessageService],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent {
  user: User | null = null;
  profileForm!: FormGroup;
  isEditing = false;
  profileData: any;

  selectedFile: File | null = null;
  uploadPreset = 'HMS - IIH Project';
  imageUrl: string | null = null;

  SearchCountryField = SearchCountryField;
  CountryISO = CountryISO;
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
      password: ['', Validators.required],
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
    this.loadProfile();
  }

  loadProfile() {
    this.profileData = {
      name: this.user?.name,
      email: this.user?.email,
      phone: this.user?.phone,
    };

    this.profileForm.patchValue(this.profileData);
    this.profileForm.patchValue({
      phone: this.profileData.phone.substring(4),
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

    // Clear all errors and update value safely
    control?.setErrors(null);
    control?.markAsTouched();

    const reader = new FileReader();
    reader.onload = () => {
      control?.setValue(reader.result);
    };
    reader.readAsDataURL(file);

    this.selectedFile = file;
    if (this.selectedFile) {
      const uploadImageSub = this.uploadService
        .uploadImage(this.selectedFile, this.uploadPreset)
        .subscribe({
          next: (res: any) => {
            this.imageUrl = res.url;
            this.profileForm.get('imageUrl')?.setValue(this.imageUrl);

            this.updateProfile();
          },
          error: (err) => {
            console.error('Error uploading image:', err);
            this.messageService.add({
              severity: 'error',
              summary: `${this.i18n.t('shared.toast.failed-to-upload-image')}`,
            });
          },
        });
      this.subscriptions.push(uploadImageSub);
    }
  }

  updateProfile() {
    if (!this.user) return;

    const getUserByIdSub = this.userService
      .getUserById(this.user.id)
      .subscribe((fullUser) => {
        let password = fullUser.password;

        if (
          this.profileForm.value.newPassword ===
            this.profileForm.value.confirmPassword &&
          this.profileForm.value.newPassword.trim() !== ''
        ) {
          password = btoa(this.profileForm.value.newPassword);
        }

        const updatedUser: User = {
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
            next: () => {
              console.log('Form Submitted');
              this.authService.login(updatedUser);
              this.messageService.add({
                severity: 'success',
                summary: `${this.i18n.t(
                  'shared.toast.profile-udpated-successfuly'
                )}`,
              });

              setTimeout(() => {
                this.router.navigate(['/profile/' + this.user?.id]);
                this.isEditing = false;
                this.user = this.authService.getCurrentUser();
                this.loadProfile();
                this.profileForm.reset();
              }, 1500);
            },
            error: (err) => {
              console.log('Error on Update', err);
              this.messageService.add({
                severity: 'error',
                summary: `${this.i18n.t('shared.toast.something-went-wrong')}`,
              });
            },
          });
        this.subscriptions.push(updateUserDetailsSub);
      });
    this.subscriptions.push(getUserByIdSub);
  }

  edit() {
    this.isEditing = true;
  }

  cancel() {
    this.isEditing = false;
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
