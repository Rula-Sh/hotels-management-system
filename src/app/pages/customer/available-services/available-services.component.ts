import { Component, OnInit, inject } from '@angular/core';
import { Service } from '../../../shared/models/Service.model';
import { ServiceService } from '../../../core/services/service.service';
import { AuthService } from '../../../core/services/auth.service';
import { ReservationService } from '../../../core/services/reservation.service';
import { CommonModule } from '@angular/common';
import { I18nPipe } from '../../../shared/pipes/i18n.pipe';
import { Room } from '../../../shared/models/Room.model';
import { ServiceRequest } from '../../../shared/models/ServiceRequest.model';
import { forkJoin, Subscription } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { I18nService } from '../../../core/services/i18n.service';
import { FormsModule } from '@angular/forms';
import { User } from '../../../shared/models/User.model';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-available-services',
  standalone: true,
  imports: [CommonModule, I18nPipe, ToastModule, FormsModule],
  providers: [MessageService],
  templateUrl: './available-services.component.html',
  styleUrl: './available-services.component.scss',
})
export class AvailableServicesComponent implements OnInit {
  user!: User;
  selectedRoomId: string = '';
  allUserRoomsServices: Service[] = [];
  filteredServices: Service[] = [];
  serviceIdToRequestIdMap: { [serviceId: string]: string } = {};
  userRooms: Room[] = [];
  requestedServiceIdsByRoom: { [roomId: string]: string[] } = {};
  requestedServiceStatusByRoom: {
    [roomId: string]: { [serviceTitle: string]: string };
  } = {};

  hotelNames: string[] = [];

  subscriptions: Subscription[] = [];
  serviceSearchTerm: string = '';
  sortBy: 'title' | 'serviceType' | 'price' | '' = '';

  sortDirection: 'Ascending' | 'Descending' = 'Ascending';

  constructor(
    private serviceService: ServiceService,
    private authService: AuthService,
    private reservationService: ReservationService,
    private messageService: MessageService,
    private i18nService: I18nService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadCustomerReservations();
  }

  loadCustomerReservations() {
    // تحميل الغرف ثم تحميل الخدمات فقط إن وُجدت غرف محجوزة
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.user = currentUser;
      const getReservationsSub = this.reservationService
        .getReservationsByCustomerId(this.user.id)
        .subscribe({
          next: (reservations) => {
            this.userRooms = reservations
              .filter(
                (res) => res.approvalStatus === 'Approved' && !res.isCheckedOut
              )
              .map((res) => res.room);

            //load all services for all the booked rooms
            this.hotelNames = [
              ...new Set(this.userRooms.map((room) => room.hotel)),
            ];
            console.log('hotelNames', this.hotelNames);

            this.route.queryParams.subscribe((params) => {
              const roomId = params['id'];
              this.selectedRoomId = roomId ?? '';
              this.onRoomSelectionChange(); // will not affect the UI because  loadUserReservationServices() overides it
            });

            this.loadUserReservationServices(this.hotelNames);
          },
          error: (error) => {
            console.error('Error loading user rooms:', error);
          },
        });

      this.subscriptions.push(getReservationsSub);
    } else {
      this.messageService.add({
        severity: 'error',
        summary: `${this.i18nService.t('shared.toast.something-went-wrong')}`,
      });
      return;
    }
  }

  loadUserReservationServices(hotelNames: string[]) {
    const userId = localStorage.getItem('id');
    if (!userId) return;

    const servicesSub = forkJoin({
      allServices: this.serviceService.getAllServices(),
      requested: this.serviceService.getServicesByCustomerId(userId),
    }).subscribe({
      next: ({ allServices, requested }) => {
        // Build status map from requested services
        requested.forEach((r) => {
          const roomId = r.room?.id;
          const serviceTitle = r.title; // This identifies the service uniquely within a room
          const status = r.requestStatus;

          if (!roomId) return;

          if (!this.requestedServiceIdsByRoom[roomId]) {
            this.requestedServiceIdsByRoom[roomId] = [];
            this.requestedServiceStatusByRoom[roomId] = {};
          }

          this.requestedServiceIdsByRoom[roomId].push(serviceTitle);
          this.requestedServiceStatusByRoom[roomId][serviceTitle] = status;
        });

        // Filter services by hotel
        this.filteredServices = allServices.filter((service) => {
          const hotelName = service.employee?.hotel ?? '';
          return hotelNames.includes(hotelName);
        });
        this.allUserRoomsServices = this.filteredServices;

        if (this.selectedRoomId) {
          // used if the user accessed the availabe services through reservation details
          this.onRoomSelectionChange();
        }

        console.log('✅ Filtered services with status:', this.filteredServices);
      },
      error: (err) => {
        console.error('Error loading services:', err);
      },
    });

    this.subscriptions.push(servicesSub);
  }

  requestService(service: Service) {
    const selectedRoom = this.userRooms.find(
      (room) => room.id === String(this.selectedRoomId)
    );

    if (!selectedRoom) {
      this.messageService.add({
        severity: 'warn',
        summary: `${this.i18nService.t('shared.toast.select-a-room-first')}`,
      });
      return;
    }

    const requestPayload: Omit<ServiceRequest, 'id'> = {
      customerId: this.user.id,
      roomId: selectedRoom.id,
      date: new Date(),
      requestStatus: 'Pending',
      notes: '',
      customer: this.user,
      room: selectedRoom,
      employeeId: service.employee?.id,
      title: service.title,
      serviceType: service.serviceType,
      details: service.details,
      price: service.price,
      imageUrl: service.imageUrl,
      employee: service.employee,
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
          this.loadUserReservationServices(this.hotelNames); // 🔄 تحديث بعد الطلب
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

  getServiceButtonLabel(service: Service): string {
    const roomId = this.selectedRoomId;
    const title = service.title;

    const status = this.requestedServiceStatusByRoom[roomId]?.[title];
    if (status === 'In Progress') return 'Approved';
    if (status === 'Pending') return 'Requested';
    return 'Request Service';
  }

  isRequestButtonDisabled(service: Service): boolean {
    const roomId = this.selectedRoomId;
    const title = service.title;

    const status = this.requestedServiceStatusByRoom[roomId]?.[title];
    return status === 'Pending' || status === 'In Progress';
  }

  onRoomSelectionChange(): void {
    console.log('Selected Room ID:', this.selectedRoomId);

    if (!this.selectedRoomId) {
      this.filterServices();
      return;
    }

    const selectedRoom = this.userRooms.find(
      (room) => room.id === String(this.selectedRoomId)
    );

    if (selectedRoom) {
      const hotelName = selectedRoom.hotel;

      // فلترة مباشرة من الخدمات التي سبق تحميلها
      this.filteredServices = this.allUserRoomsServices.filter(
        (service) => service.employee?.hotel === hotelName
      );

      // يمكنكِ طباعة النتائج للتأكد
      console.log('🔍 خدمات الفندق:', hotelName, this.filteredServices);
    } else {
      this.filteredServices = []; // في حال لم يتم العثور على الغرفة
    }
  }

  filterServices(): void {
    let services = [...this.allUserRoomsServices];
    if (this.selectedRoomId) {
      this.onRoomSelectionChange();
      services = [...this.filteredServices];
    }

    // Filter by search
    const term = this.serviceSearchTerm.toLowerCase().trim();
    if (term) {
      services = services.filter(
        (s) =>
          s.title.toLowerCase().includes(term) ||
          s.serviceType.toLowerCase().includes(term)
      );
    }

    // Filter by sortBy
    if (this.sortBy) {
      services.sort((a, b) => {
        let valA: string | number;
        let valB: string | number;

        switch (this.sortBy) {
          case 'title':
            valA = a.title.toLowerCase();
            valB = b.title.toLowerCase();
            break;
          case 'serviceType':
            valA = a.serviceType.toLowerCase();
            valB = b.serviceType.toLowerCase();
            break;
          case 'price':
            valA = a.price;
            valB = b.price;
            break;
          default:
            return 0;
        }

        if (valA < valB) return this.sortDirection === 'Ascending' ? -1 : 1;
        if (valA > valB) return this.sortDirection === 'Ascending' ? 1 : -1;
        return 0;
      });
    }

    this.filteredServices = services;
  }

  toggleSortDirection(): void {
    this.sortDirection =
      this.sortDirection === 'Ascending' ? 'Descending' : 'Ascending';
    this.filterServices();
  }

  clearSearchInput() {
    this.serviceSearchTerm = '';
    this.filterServices();
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
