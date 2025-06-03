import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Service } from '../../../models/Service.model';
import { ServiceService } from '../../../services/service.service';
import { AuthService } from '../../../services/auth.service';
import { ReservationService } from '../../../services/reservation.service';
import { CommonModule } from '@angular/common';
import { I18nPipe } from '../../../pipes/i18n.pipe';
import { Room } from '../../../models/Room.model';
import { NgbToastModule } from '@ng-bootstrap/ng-bootstrap';
import { ServiceRequest } from '../../../models/ServiceRequest.model';

@Component({
  selector: 'app-available-services',
  standalone: true,
  imports: [CommonModule, I18nPipe, NgbToastModule],
  templateUrl: './available-services.component.html',
  styleUrl: './available-services.component.scss',
})
export class AvailableServicesComponent implements OnInit {
  services: Service[] = [];
  filteredServices: Service[] = [];
  userRooms: Room[] = [];
  toastMessage = '';
  showToast = false;
  requestedServiceIds: string[] = [];
  requestedServicesStatus: { [title: string]: string } = {};

  private serviceService = inject(ServiceService);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private reservationService = inject(ReservationService);

  ngOnInit(): void {
    this.loadUserRequestedServices();
    this.route.queryParams.subscribe((params) => {
      const hotelName = params['hotel'];
      console.log('📦 اسم الفندق من الرابط:', hotelName);
      this.loadAvailableServices(hotelName);
    });

    this.loadUserRooms();
  }

  loadUserRequestedServices() {
    const userId = localStorage.getItem('id');
    if (!userId) return;

    this.serviceService.getServicesByCustomerId(userId).subscribe({
      next: (requests) => {
        // بناء خريطة عنوان الخدمة -> حالة الطلب
        this.requestedServicesStatus = {};
        requests.forEach((req) => {
          this.requestedServicesStatus[req.title] = req.requestStatus;
        });

        // أيضاً لتسهيل التحقق بـ requestedServiceIds إذا حابب تستخدمه:
        this.requestedServiceIds = requests.map((r) => r.title);
      },
      error: () => {
        console.error('Failed to load requested services.');
      },
    });
  }

  saveRequestedServices() {
    localStorage.setItem(
      'requestedServiceIds',
      JSON.stringify(this.requestedServiceIds)
    );
  }

  loadAvailableServices(hotelName?: string): void {
    this.serviceService.getAllServices().subscribe({
      next: (services: Service[]) => {
        this.services = services;
        // طباعة أسماء الفنادق الموجودة في الخدمات
        const allHotelNames = services.map((s) => s.employee?.hotel);
        console.log('📋 الفنادق الموجودة في الخدمات:', allHotelNames);

        this.filteredServices = hotelName
          ? services.filter((service) => service.employee?.hotel === hotelName)
          : services;

        console.log('✅ الخدمات بعد الفلترة:', this.filteredServices);
      },
      error: (error) => {
        console.error('Error loading services:', error);
      },
    });
  }

  loadUserRooms() {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.reservationService.getReservationsByCustomerId(user.id).subscribe({
        next: (reservations) => {
          this.userRooms = reservations.map((r) => r.room);
        },
        error: (error) => {
          console.error('Error loading user rooms:', error);
        },
      });
    }
  }

  requestService(service: Service) {
    const user = this.authService.getCurrentUser();
    const selectedRoom = this.userRooms[0];

    if (!user || !selectedRoom) {
      this.showToastMessage('No room selected or user not found');
      return;
    }

    const requestPayload: Omit<ServiceRequest, 'id'> = {
      customerId: user.id,
      roomId: selectedRoom.id,
      date: new Date(),
      requestStatus: 'Pending',
      notes: '',
      customer: user,
      room: selectedRoom,
      employeeId: service.employee?.id,
      title: service.title,
      serviceType: service.serviceType,
      details: service.details,
      price: service.price,
      imageUrl: service.imageUrl,
      employee: undefined as any,
    };

    this.serviceService.createServiceRequest(requestPayload).subscribe({
      next: () => {
        this.showToastMessage('Service request submitted successfully!');
        this.loadUserRequestedServices(); // 🔄 إعادة تحميل الطلبات للمستخدم الحالي
      },
      error: () => {
        this.showToastMessage('Failed to submit service request.');
      },
    });
  }

  showToastMessage(message: string) {
    this.toastMessage = message;
    this.showToast = true;
    setTimeout(() => (this.showToast = false), 3000);
  }
}
