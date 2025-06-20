import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { I18nPipe } from '../../../shared/pipes/i18n.pipe';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { I18nService } from '../../../core/services/i18n.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ServiceService } from '../../../core/services/service.service';
import {
  Service,
  serviceTypesByJobTitle,
} from '../../../shared/models/Service.model';
import { AuthService } from '../../../core/services/auth.service';
import { Employee, JobTitle } from '../../../shared/models/Employee.model';
import { UploadService } from '../../../core/services/upload.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-add-service',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    I18nPipe,
    ToastModule,
    RouterLink,
  ],
  providers: [MessageService],
  templateUrl: './service-form.component.html',
  styleUrl: './service-form.component.scss',
})
export class ServiceFormComponent {
  serviceForm!: FormGroup;
  user: Employee | null = null;
  jobTitle: string | null = null;
  servicesTypes: string[] = [];
  isAddingAService = true;
  service!: any;

  selectedFile: File | null = null;
  imageUrl: string | null = null;
  uploadPreset = 'HMS - IIH Project';

  subscriptions: Subscription[] = [];

  get lang(): 'en' | 'ar' {
    return this.i18nService.getLanguage();
  }

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService,
    private i18nService: I18nService,
    private serviceService: ServiceService,
    private activatedRoute: ActivatedRoute,
    private messageService: MessageService,
    private uploadService: UploadService,
    private i18n: I18nService
  ) {}

  ngOnInit() {
    if (this.router.url.includes('edit-service')) {
      this.isAddingAService = false;

      var serviceId = this.activatedRoute.snapshot.paramMap.get('id');
      if (serviceId) {
        const getServiceByIdSub = this.serviceService
          .getServiceById(serviceId)
          .subscribe({
            next: (value) => {
              this.service = value;
              console.log('Recieved Service Details');
              this.loadService();
            },
            error: (err) => {
              console.log('Error Loading Service Details:', err);
            },
          });
        this.subscriptions.push(getServiceByIdSub);
      }
    }

    this.user = this.authService.getCurrentEmployee();

    this.serviceForm = this.fb.group({
      title: [
        '',
        [
          Validators.required,
          Validators.minLength(4),
          Validators.maxLength(30),
          Validators.pattern(/^[a-zA-Z0-9\u0600-\u06FF'\-$!& ]+$/),
        ],
      ],
      serviceType: ['', Validators.required],
      details: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(70),
          Validators.pattern(/^[a-zA-Z0-9\u0600-\u06FF.,!?'"()\-:;$!& ]*$/),
        ],
      ],
      price: [
        '',
        [
          Validators.required,
          Validators.min(1),
          Validators.max(9999),
          Validators.pattern(/^\d{1,4}(\.\d{1,2})?$/),
        ],
      ],
      imageUrl: ['', Validators.required],
    });

    this.jobTitle = localStorage.getItem('jobTitle');
    this.updateServiceTypes();
  }

  updateServiceTypes() {
    const title = this.jobTitle as JobTitle;
    if (title && serviceTypesByJobTitle[title]) {
      this.servicesTypes = serviceTypesByJobTitle[title];
    } else {
      this.servicesTypes = [];
    }
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

  onFileSelected(event: any) {
    const file = event.target.files[0];
    const control = this.serviceForm.get('imageUrl');

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
  }

  removeImage() {
    this.serviceForm.get('imageUrl')?.reset();
    this.selectedFile = null;
  }

  submit() {
    if (this.serviceForm.invalid) {
      this.serviceForm.markAllAsTouched();
      return;
    }

    if (!this.selectedFile) {
      console.error('Upload an image first');
      return;
    }

    const uploadImageSub = this.uploadService
      .uploadImage(this.selectedFile, this.uploadPreset)
      .subscribe({
        next: (res: any) => {
          this.imageUrl = res.url;
          this.serviceForm.get('imageUrl')?.setValue(this.imageUrl);

          this.saveService();
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

  saveService() {
    if (!this.user) {
      console.error('User is not logged in');
      this.router.navigate(['/login']);
      return;
    }
    if (!this.imageUrl) {
      console.error('Upload an image first');
      return;
    }

    if (this.isAddingAService) {
      const newService: Omit<Service, 'id'> = {
        title: this.serviceForm.value.title,
        serviceType: this.serviceForm.value.serviceType,
        details: this.serviceForm.value.details,
        price: this.serviceForm.value.price,
        imageUrl: this.imageUrl,
        employeeId: this.user?.id!,
        employee: this.user,
      };

      const createServiceSub = this.serviceService
        .createService(newService)
        .subscribe({
          next: () => {
            console.log('Service added successfully');
            this.messageService.add({
              severity: 'success',
              summary: `${this.i18n.t(
                'shared.toast.service-added-successfuly'
              )}`,
            });
            setTimeout(() => {
              this.router.navigate(['/employee/services']);
              this.serviceForm.reset();
            }, 1500);
          },
          error: (err) => {
            console.log('Error on Adding a Service', err);
            this.messageService.add({
              severity: 'error',
              summary: `${this.i18n.t('shared.toast.something-went-wrong')}`,
            });
          },
        });
      this.subscriptions.push(createServiceSub);
    } else {
      const updatedService: Service = {
        id: this.service.id,
        title: this.serviceForm.value.title,
        serviceType: this.serviceForm.value.serviceType,
        details: this.serviceForm.value.details,
        price: this.serviceForm.value.price,
        imageUrl: this.serviceForm.value.imageUrl,
        employeeId: this.service.employeeId,
        employee: this.service.employee,
      };

      const updateServiceSub = this.serviceService
        .updateService(updatedService)
        .subscribe({
          next: () => {
            console.log('Service added successfully');
            this.messageService.add({
              severity: 'success',
              summary: `${this.i18n.t(
                'shared.toast.service-updated-successfuly'
              )}`,
            });
            setTimeout(() => {
              this.router.navigate(['/employee/services']);
              this.serviceForm.reset();
            }, 1500);
          },
          error: (err) => {
            console.log('Error on Adding a Service', err);
            this.messageService.add({
              severity: 'error',
              summary: `${this.i18n.t('shared.toast.something-went-wrong')}`,
            });
          },
        });
      this.subscriptions.push(updateServiceSub);
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
