import { Component } from '@angular/core';
import {
  FormBuilder,
  FormControl,
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

@Component({
  selector: 'app-profile',
  imports: [FormsModule, ReactiveFormsModule, CommonModule, I18nPipe],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent {
  user: User | null = null;
  profileForm!: FormGroup;
  isEditing = false;
  profileData: any;

  get lang(): 'en' | 'ar' {
    return this.i18nService.getLanguage();
  }

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private fb: FormBuilder,
    private i18nService: I18nService
  ) {}

  ngOnInit() {
    this.user = this.authService.getCurrentUser();
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
      password: ['', Validators.required],
      newPassword: ['', Validators.minLength(6)],
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
    // i can use mark all as touched to validate the data once it is loaded
  }

  UpdateProfile() {
    if (!this.user) return;

    this.userService.getUserById(this.user.id).subscribe((fullUser) => {
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
        phone: this.profileForm.value.phone,
        password: password,
        role: this.user!.role,
      };

      this.userService.UpdateUserDetails(updatedUser).subscribe({
        next: () => {
          console.log('Form Submitted');
          this.authService.login(updatedUser);
          this.router.navigate(['/']);
          this.profileForm.reset();
        },
        error: (err) => {
          console.log('Error on Update', err);
        },
      });
    });
  }

  edit() {
    this.isEditing = true;
  }

  cancel() {
    this.isEditing = false;
  }
}
