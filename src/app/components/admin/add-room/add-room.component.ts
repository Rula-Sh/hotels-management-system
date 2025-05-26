import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
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
import { Room } from '../../../models/Room.model';
import { RoomService } from '../../../services/room.service';

@Component({
  selector: 'app-add-room',
  imports: [FormsModule, ReactiveFormsModule, CommonModule, I18nPipe],
  templateUrl: './add-room.component.html',
  styleUrl: './add-room.component.scss',
})
export class AddRoomComponent {
  private userSub!: Subscription;
  roomForm!: FormGroup;

  get lang(): 'en' | 'ar' {
    return this.i18nService.getLanguage();
  }

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private i18nService: I18nService,
    private roomService: RoomService
  ) {}

  ngOnInit() {
    this.roomForm = this.fb.group({
      title: ['', Validators.required, Validators.maxLength(30)],
      roomType: ['', Validators.required],
      floor: ['', Validators.required, Validators.maxLength(2)],
      hotel: ['', Validators.required, Validators.maxLength(30)],
      details: ['', Validators.required, Validators.maxLength(500)],
      price: ['', Validators.required, Validators.maxLength(4)],
      imageUrl: ['', Validators.required],
    });
  }

  addRoom() {
    if (this.roomForm.invalid) {
      return this.roomForm.markAllAsTouched();
    }

    const newRoom: Omit<Room, 'id'> = {
      title: this.roomForm.value.title,
      roomType: this.roomForm.value.roomType,
      floor: this.roomForm.value.floor,
      hotel: this.roomForm.value.hotel,
      details: this.roomForm.value.details,
      bookedStatus: 'Available',
      price: this.roomForm.value.price,
      imageUrl: this.roomForm.value.imageUrl,
    };

    this.roomService.CreateRoom(newRoom).subscribe({
      next: () => {
        console.log('Room added successfully');
        this.router.navigate(['/rooms']);
        this.roomForm.reset();
      },
      error: (err) => {
        console.log('Error on Adding a Room', err);
      },
    });
  }

  goBack() {
    this.router.navigate(['/rooms']);
  }
}
