import { Component } from '@angular/core';
import { I18nPipe } from '../../../pipes/i18n.pipe';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ConfirmationService, MessageService, PrimeIcons } from 'primeng/api';
import { Room } from '../../../models/Room.model';
import { RoomService } from '../../../services/room.service';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-rooms',
  imports: [
    I18nPipe,
    ToastModule,
    ConfirmDialogModule,
    CommonModule,
    ButtonModule,
  ],
  providers: [MessageService, ConfirmationService, PrimeIcons],
  templateUrl: './rooms.component.html',
  styleUrl: './rooms.component.scss',
})
export class RoomsComponent {
  rooms: Room[] = [];

  constructor(
    private roomService: RoomService,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
  ) {}

  role: string | null = null;
  ngOnInit() {
    this.getRooms();
    this.role = localStorage.getItem('user_role');
  }

  getRooms() {
    this.roomService.getAllRooms().subscribe({
      next: (value) => {
        this.rooms = value;
        console.log('Rooms Loaded Successfuly');
      },
      error: (err) => {
        console.log(`Failed to Load Rooms: ${err}`);
      },
    });
  }

  showRoomDetails(id: string) {
    this.router.navigate([`room/${id}`]);
  }

  AddRoom() {
    this.router.navigate([`admin/add-room`]);
  }

  deleteRoom(id: string) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to remove this room?',
      header: 'Remove Room',
      accept: () => {
        this.roomService.RemoveRoom(id).subscribe({
          next: (value) => {
            console.log('Room deleted');
            this.getRooms();
          },
          error(err) {
            console.log('Error deleting room: ' + err);
          },
        });
        this.messageService.add({
          severity: 'error',
          summary: 'Room Removed',
        });
      },
      reject: () => {},
    });
  }
}
