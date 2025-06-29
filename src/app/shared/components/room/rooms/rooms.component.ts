import { Component } from '@angular/core';
import { I18nPipe } from '../../../pipes/i18n.pipe';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ConfirmationService, MessageService, PrimeIcons } from 'primeng/api';
import { Room } from '../../../models/Room.model';
import { RoomService } from '../../../../core/services/room.service';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { User } from '../../../models/User.model';
import { I18nService } from '../../../../core/services/i18n.service';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-rooms',
  imports: [
    I18nPipe,
    ToastModule,
    ConfirmDialogModule,
    CommonModule,
    ButtonModule,
    RouterLink,
    FormsModule,
  ],
  providers: [MessageService, ConfirmationService, PrimeIcons],
  templateUrl: './rooms.component.html',
  styleUrl: './rooms.component.scss',
})
export class RoomsComponent {
  rooms: Room[] = [];
  user: User | null = null;

  searchInput: string = '';
  sortBy: 'title' | 'type' | 'hotel' | 'capacity' | 'price' | '' = '';
  filteredRooms: Room[] = [];
  sortDirection: 'Ascending' | 'Descending' = 'Ascending';

  subscriptions: Subscription[] = [];

  get lang(): 'en' | 'ar' {
    return this.i18nService.getLanguage();
  }

  constructor(
    private roomService: RoomService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private authService: AuthService,
    private i18nService: I18nService
  ) {}

  role: string | null = null;
  ngOnInit() {
    this.getRooms();
    this.role = localStorage.getItem('user_role');
    // fetch current user
    if (this.authService) {
      try {
        this.user = this.authService.getCurrentUser();
      } catch {
        this.user = null;
      }
    }
  }

  getRooms() {
    const getRoomsSub = this.roomService.getAllRooms().subscribe({
      next: (rooms) => {
        // const approvedRoomIds = rooms
        //   .filter((r) => r.bookedStatus === 'Booked')
        //   .map((r) => r.id);
        // // ✅ تصفية الغرف بناءً على الحجز الموافق عليه
        // this.rooms = rooms.filter((room) => !approvedRoomIds.includes(room.id));
        this.rooms = rooms;
        this.applyFilters();
      },
      error: (err) => {
        console.error('Failed to load rooms:', err);
      },
    });

    this.subscriptions.push(getRoomsSub);
  }

// for rooms filering and sorting
  applyFilters() {
    this.filteredRooms = this.rooms
      .filter((room) =>
        room.title.toLowerCase().includes(this.searchInput.toLowerCase())
      )
      .sort((a, b) => {
        let result = 0;

        if (this.sortBy === 'title') {
          result = a.title.localeCompare(b.title);
        } else if (this.sortBy === 'type') {
          result = a.roomType.localeCompare(b.roomType);
        } else if (this.sortBy === 'hotel') {
          result = a.hotel.localeCompare(b.hotel);
        } else if (this.sortBy === 'capacity') {
          result = a.capacity - b.capacity;
        } else if (this.sortBy === 'price') {
          result = a.price - b.price;
        }

        return this.sortDirection === 'Ascending' ? result : -result;
      });
  }

  onSearchChange() {
    this.applyFilters();
  }

  onSortChange(value: string) {
    this.sortBy = value as 'title' | 'type' | 'hotel' | 'capacity' | 'price';
    this.applyFilters();
  }

  toggleSortDirection() {
    this.sortDirection =
      this.sortDirection === 'Ascending' ? 'Descending' : 'Ascending';
    this.applyFilters();
  }

  clearSearchInput() {
    this.searchInput = '';
    this.applyFilters();
  }

  deleteRoom(id: string) {
    this.confirmationService.confirm({
      message: `${this.i18nService.t(
        'shared.confirm-dialog.confirm-remove-room-question'
      )}`,
      header: `${this.i18nService.t('shared.confirm-dialog.remove-room')}`,
      accept: () => {
        const removeRoomSub = this.roomService.removeRoom(id).subscribe({
          next: () => {
            console.log('Room deleted');
            this.getRooms();
          },
          error(err) {
            console.log('Error deleting room: ' + err);
          },
        });
        this.messageService.add({
          severity: 'error',
          summary: `${this.i18nService.t('shared.toast.room-removed')}`,
        });
        this.subscriptions.push(removeRoomSub);
      },
      reject: () => {},
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
