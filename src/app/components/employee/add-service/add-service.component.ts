import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { I18nPipe } from '../../../pipes/i18n.pipe';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { I18nService } from '../../../services/i18n.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ServiceService } from '../../../services/service.service';
import { Service } from '../../../models/Service.model';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/User.model';
import { Employee } from '../../../models/Employee.model';

@Component({
  selector: 'app-add-service',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    I18nPipe,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './add-service.component.html',
  styleUrl: './add-service.component.scss',
})
export class AddServiceComponent {
  serviceForm!: FormGroup;
  user: Employee | null = null;
  servicesTypes = ['Cleaning', 'Dining', 'Maintenance', 'Health', 'Beauty'];

  get lang(): 'en' | 'ar' {
    return this.i18nService.getLanguage();
  }

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService,
    private i18nService: I18nService,
    private serviceService: ServiceService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.user = this.authService.getCurrentEmployee();
    console.log(this.user);

    this.serviceForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(30)]],
      serviceType: ['', Validators.required],
      details: ['', [Validators.required, Validators.maxLength(500)]],
      price: ['', [Validators.required, Validators.maxLength(4)]],
      imageUrl: ['', Validators.required],
    });
  }

  addService() {
    if (this.serviceForm.invalid) {
      return this.serviceForm.markAllAsTouched();
    }
    if (!this.user) {
      console.error('User is not logged in');
      return;
    }

    const newService: Omit<Service, 'id'> = {
      title: this.serviceForm.value.title,
      serviceType: this.serviceForm.value.serviceType,
      details: this.serviceForm.value.details,
      price: this.serviceForm.value.price,
      imageUrl: this.serviceForm.value.imageUrl,
      employeeId: this.user?.id!,
      employee: this.user,
    };

    this.serviceService.CreateService(newService).subscribe({
      next: () => {
        console.log('Service added successfully');
        this.router.navigate(['/employee/services']);
        this.serviceForm.reset();
      },
      error: (err) => {
        console.log('Error on Adding a Service', err);
      },
    });
  }

  goBack() {
    this.router.navigate(['/employee/services']);
  }
}
