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
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-available-services',
  standalone: true,
  imports: [CommonModule, I18nPipe, ToastModule, FormsModule],
  providers: [MessageService],
  templateUrl: './available-services.component.html',
  styleUrl: './available-services.component.scss',
})
export class AvailableServicesComponent implements OnInit {
  selectedRoomId: number | null = null;
  services: Service[] = [];
  filteredServices: Service[] = [];
  userRooms: Room[] = [];
  requestedServiceIds: string[] = [];
  requestedServicesStatus: { [title: string]: string } = {};

  subscriptions: Subscription[] = [];
serviceSearchTerm: string = '';
sortBy: 'title' | 'serviceType' | 'price' | null = null;



sortDirection: 'Ascending' | 'Descending' = 'Ascending';


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

    // تحميل الغرف ثم تحميل الخدمات فقط إن وُجدت غرف محجوزة
    const user = this.authService.getCurrentUser();
    if (user) {
      const getReservationsSub = this.reservationService
        .getReservationsByCustomerId(user.id)
        .subscribe({
          next: (reservations) => {
            this.userRooms = reservations
              .filter((res) => res.approvalStatus === 'Approved')
              .map((res) => res.room);

            if (this.userRooms.length === 0) {
              this.messageService.add({
                severity: 'warn',
                summary: this.i18nService.t('shared.toast.no-approved-rooms'),
              });
              return;
            }

          // تعيين الغرفة الافتراضية أولاً
          this.selectedRoomId = Number(this.userRooms[0].id);

            this.route.queryParams.subscribe((params) => {
              const hotelName = params['hotel'];
              this.loadAvailableServices(hotelName);
            });
          },
          error: (error) => {
            console.error('Error loading user rooms:', error);
          },
        });

      this.subscriptions.push(getReservationsSub);
    }
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

        this.filteredServices = hotelName
          ? services.filter((service) => service.employee?.hotel === hotelName)
          : services;

        console.log('✅ الخدمات بعد الفلترة:', this.filteredServices);
        // عند انتهاء تحميل الخدمات، فلترة بناءً على الغرفة المختارة
      this.onRoomSelectionChange();
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
            this.userRooms = reservations
              .filter((res) => res.approvalStatus === 'Approved')
              .map((res) => res.room);
            if (this.userRooms.length > 0) {
              this.selectedRoomId = Number(this.userRooms[0].id);
            }
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

  const selectedRoom = this.userRooms.find(
    (room) => room.id=== String(this.selectedRoomId)
  );

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
        this.loadUserRequestedServices(); // 🔄 تحديث بعد الطلب
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
   getServiceButtonLabel(serviceTitle: string): string {
    const status = this.requestedServicesStatus[serviceTitle];
    if (status === 'Completed' || status === 'In Progress') return 'Approved';
    if (status === 'Pending') return 'Requested';
    return 'Request Service';
  }

  isRequestButtonDisabled(serviceTitle: string): boolean {
    const status = this.requestedServicesStatus[serviceTitle];
    return (
      status === 'Pending' || status === 'In Progress' || status === 'Completed'
    );
  }
  onRoomSelectionChange(): void {
      console.log('Selected Room ID:', this.selectedRoomId);
      // this.filterAndSortServices();
  const selectedRoom = this.userRooms.find(
    (room) => room.id === String(this.selectedRoomId)
  );

  if (selectedRoom) {
    const hotelName = selectedRoom.hotel;

    // فلترة مباشرة من الخدمات التي سبق تحميلها
    this.filteredServices = this.services.filter(
      (service) => service.employee?.hotel === hotelName
    );
      // يمكنكِ طباعة النتائج للتأكد
    console.log('🔍 خدمات الفندق:', hotelName, this.filteredServices);
  } else {
    this.filteredServices = []; // في حال لم يتم العثور على الغرفة
  }
}
// filterAndSortServices() {
//   if (!this.selectedRoomId) {
//     this.filteredServices = [];
//     return;
//   }

//   const selectedRoom = this.userRooms.find(
//     (room) => room.id === String(this.selectedRoomId)
//   );

//   if (!selectedRoom) {
//     this.filteredServices = [];
//     return;
//   }

//   // فلترة حسب الفندق
//   let services = this.services.filter(
//     (service) => service.employee?.hotel === selectedRoom.hotel
//   );

//   // فلترة بحث نصي
//   if (this.serviceSearchTerm.trim() !== '') {
//     const term = this.serviceSearchTerm.trim().toLowerCase();
//     services = services.filter((s) =>
//       s.title.toLowerCase().includes(term) ||
//       s.details.toLowerCase().includes(term) ||
//       s.serviceType.toLowerCase().includes(term)
//     );
//   }

//   // ترتيب
// if (this.sortBy!==null) {
//   services = services.sort((a, b) => {
//     let valA = a[this.sortBy];
//     let valB = b[this.sortBy];

//     if (typeof valA === 'string') valA = valA.toLowerCase();
//     if (typeof valB === 'string') valB = valB.toLowerCase();

//     if (valA < valB) return this.sortDirection === 'Ascending' ? -1 : 1;
//     if (valA > valB) return this.sortDirection === 'Ascending' ? 1 : -1;
//     return 0;
//   });
// }



//   this.filteredServices = services;
// }
filterServices() {
  let services = [...this.filteredServices];

  // فلترة حسب النص
  const term = this.serviceSearchTerm.toLowerCase().trim();
  if (term) {
    services = services.filter(s =>
      s.title.toLowerCase().includes(term) ||
      s.details.toLowerCase().includes(term) ||
      s.serviceType.toLowerCase().includes(term)
    );
  }

  // فرز حسب الاختيار
  if (this.sortBy !== null) {
    services.sort((a, b) => {
      const sortBy = this.sortBy as 'title' | 'serviceType' | 'price';
      let compA = a[sortBy];
      let compB = b[sortBy];

      if (typeof compA === 'string') compA = compA.toLowerCase();
      if (typeof compB === 'string') compB = compB.toLowerCase();

      if (compA < compB) return this.sortDirection === 'Ascending' ? -1 : 1;
      if (compA > compB) return this.sortDirection === 'Ascending' ? 1 : -1;
      return 0;
    });
  }

  this.filteredServices = services;
}

onSortChange(value: string) {
  this.sortBy = value as 'title' | 'serviceType' | 'price';
  this.applyFilters();
}

applyFilters(): void {
  this.filteredServices = this.services
    .filter(service =>
      service.title.toLowerCase().includes(this.serviceSearchTerm.toLowerCase())
    );

  if (this.sortBy) {  // هنا نتأكد أنها ليست null أو فارغة
    this.filteredServices.sort((a, b) => {
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
          return 0;  // لا تغيير بالترتيب إذا غير معروف
      }

      if (valA < valB) return this.sortDirection === 'Ascending' ? -1 : 1;
      if (valA > valB) return this.sortDirection === 'Ascending' ? 1 : -1;
      return 0;
    });
  }
}

  onSearchChange(): void {
    this.applyFilters();
  }
 toggleSortDirection(): void {
    this.sortDirection =
      this.sortDirection === 'Ascending' ? 'Descending' : 'Ascending';
    this.applyFilters();
  }
 

}
