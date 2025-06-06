import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Service } from '../../../models/Service.model';
import { ServiceService } from '../../../services/service.service';
import { AuthService } from '../../../services/auth.service';
import { ReservationService } from '../../../services/reservation.service';
import { CommonModule } from '@angular/common';
import { I18nPipe } from '../../../pipes/i18n.pipe';
import { Room } from '../../../models/Room.model';
import { ServiceRequest } from '../../../models/ServiceRequest.model';
import { Subscription } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { I18nService } from '../../../services/i18n.service';

@Component({
  selector: 'app-available-services',
  standalone: true,
  imports: [CommonModule, I18nPipe, ToastModule],
  providers: [MessageService],
  templateUrl: './available-services.component.html',
  styleUrl: './available-services.component.scss',
})
export class AvailableServicesComponent implements OnInit {
  services: Service[] = [];
  filteredServices: Service[] = [];
  userRooms: Room[] = [];
  requestedServiceIds: string[] = [];
  requestedServicesStatus: { [title: string]: string } = {};

  subscriptions: Subscription[] = [];

  constructor(
    private serviceService: ServiceService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private reservationService: ReservationService,
    private messageService: MessageService,
    private i18nService: I18nService
  ) {}

  ngOnInit(): void {
    this.loadUserRequestedServices();
    const loadAvailableServicesByHotelNameSub =
      this.route.queryParams.subscribe((params) => {
        const hotelName = params['hotel'];
        console.log('📦 اسم الفندق من الرابط:', hotelName);
        this.loadAvailableServices(hotelName);
      });
    this.subscriptions.push(loadAvailableServicesByHotelNameSub);

    this.loadUserRooms();
  }

  loadUserRequestedServices() {
    const userId = localStorage.getItem('id');
    if (!userId) return;

    const getServicesByCustomerIdSub = this.serviceService
      .getServicesByCustomerId(userId)
      .subscribe({
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
    this.subscriptions.push(getServicesByCustomerIdSub);
  }

  saveRequestedServices() {
    localStorage.setItem(
      'requestedServiceIds',
      JSON.stringify(this.requestedServiceIds)
    );
  }

  loadAvailableServices(hotelName?: string): void {
    const getAllServicesSub = this.serviceService.getAllServices().subscribe({
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
    this.subscriptions.push(getAllServicesSub);
  }

  loadUserRooms() {
    const user = this.authService.getCurrentUser();
    if (user) {
      const getReservationsByCustomerIdSub = this.reservationService
        .getReservationsByCustomerId(user.id)
        .subscribe({
          next: (reservations) => {
            this.userRooms = reservations.map((r) => r.room);
          },
          error: (error) => {
            console.error('Error loading user rooms:', error);
          },
        });
      this.subscriptions.push(getReservationsByCustomerIdSub);
    }
  }

  requestService(service: Service) {
    const user = this.authService.getCurrentUser();
    const selectedRoom = this.userRooms[0];

    if (!user || !selectedRoom) {
      this.messageService.add({
        severity: 'error',
        summary: `${this.i18nService.t(
          'shared.toast.no-room-selected-or-user-found'
        )}`,
      });
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

    const createServiceRequestSub = this.serviceService
      .createServiceRequest(requestPayload)
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: `${this.i18nService.t(
              'shared.toast.service-request-submitted-successfully'
            )}`,
          });
          this.loadUserRequestedServices(); // 🔄 إعادة تحميل الطلبات للمستخدم الحالي
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: `${this.i18nService.t(
              'shared.toast.something-went-wrong'
            )}`,
          });
        },
      });
    this.subscriptions.push(createServiceRequestSub);
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
