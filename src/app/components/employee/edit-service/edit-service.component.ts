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
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { I18nService } from '../../../services/i18n.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ServiceService } from '../../../services/service.service';
import { Service } from '../../../models/Service.model';
import { AuthService } from '../../../services/auth.service';
import { Employee } from '../../../models/Employee.model';

@Component({
  selector: 'app-edit-service',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    I18nPipe,
    ToastModule,
    RouterLink,
  ],
  providers: [MessageService],
  templateUrl: './edit-service.component.html',
  styleUrl: './edit-service.component.scss',
})
export class EditServiceComponent {
  serviceForm!: FormGroup;
  servicesTypes = ['Cleaning', 'Dining', 'Maintenance', 'Health', 'Beauty'];
  service!: any;

  get lang(): 'en' | 'ar' {
    return this.i18nService.getLanguage();
  }

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private authService: AuthService,
    private i18nService: I18nService,
    private serviceService: ServiceService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.setupPage();
  }

  setupPage() {
    var serviceId = this.activatedRoute.snapshot.paramMap.get('id');
    if (serviceId) {
      this.serviceService.getServiceById(serviceId).subscribe({
        next: (value) => {
          this.service = value;
          console.log('Recieved Service Details');
          this.loadService();
        },
        error: (err) => {
          console.log('Error Loading Service Details:', err);
        },
      });
    }

    this.serviceForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(30)]],
      serviceType: ['', Validators.required],
      details: ['', [Validators.required, Validators.maxLength(500)]],
      price: ['', [Validators.required, Validators.maxLength(4)]],
      imageUrl: ['', Validators.required],
    });
  }

  loadService() {
    const serviceData = {
      title: this.service.title,
      serviceType: this.service.serviceType,
      details: this.service.details,
      price: this.service.price,
      imageUrl: this.service.imageUrl,
    };

    this.serviceForm.patchValue(serviceData);
  }

  editService() {
    if (this.serviceForm.invalid) {
      return this.serviceForm.markAllAsTouched();
    }

    const newService: Service = {
      id: this.service.id,
      title: this.serviceForm.value.title,
      serviceType: this.serviceForm.value.serviceType,
      details: this.serviceForm.value.details,
      price: this.serviceForm.value.price,
      imageUrl: this.serviceForm.value.imageUrl,
      employeeId: this.service.employeeId,
      employee: this.service.employee,
    };

    this.serviceService.UpdateService(newService).subscribe({
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
}
