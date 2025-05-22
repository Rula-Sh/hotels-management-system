import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from '../../../../models/User.model';
import { AuthService } from '../../../../services/auth.service';
import { UserService } from '../../../../services/user.service';

@Component({
  selector: 'app-sign-up',
   standalone: true,
  imports: [FormsModule,ReactiveFormsModule,CommonModule],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss'
})
export class SignUpComponent {
    signUpForm!: FormGroup;
     submitted = false;
  error!: string;
constructor(private fb: FormBuilder,private router: Router,private authService: AuthService,private userService: UserService) {

this.signUpForm = this.fb.group({
  name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/) // At least one uppercase and one number
      ]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordsMatchValidator });
  }

 // Custom validator to check password match
  passwordsMatchValidator(form: AbstractControl): ValidationErrors | null {
  const password = form.get('password')?.value;
  const confirmPassword = form.get('confirmPassword')?.value;

  return password === confirmPassword ? null : { mismatch: true };
}

  
  onSubmit() {
  this.submitted = true;
  if (this.signUpForm.invalid) return;

  this.userService.getAllUsers().subscribe(users => {
    const exists = users.find(u => u.email === this.signUpForm.value.email);
    if (exists) {
      this.error = 'Email already registered';
      return;
    }
    const user: User = {
      id: '',
      name: this.signUpForm.value.name,
      email: this.signUpForm.value.email,
      phone: this.signUpForm.value.phone,
      password: btoa(this.signUpForm.value.password),
      role: 'customer'
    };
    this.userService.CreateUser(user).subscribe({
      next: () => {
        this.authService.login(user);
        this.router.navigate(['/']);
      },error: (err) => {
          console.log('Error on Update', err);
        },
      
    });
    });
  }
  get f() {
    return this.signUpForm.controls;
  }


}


