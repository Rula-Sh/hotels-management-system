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
import { Room } from '../../../models/Room.model';
import { RoomService } from '../../../services/room.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-add-room',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    I18nPipe,
    ToastModule,
  ],
  providers: [MessageService],
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
    private roomService: RoomService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.roomForm = this.fb.group({
      title: ['', Validators.required, Validators.maxLength(30)],
      roomType: ['', Validators.required],
      floor: ['', Validators.required, Validators.maxLength(2)],
      hotel: ['', Validators.required, Validators.maxLength(30)],
      details: ['', Validators.required, Validators.maxLength(500)],
      price: ['', Validators.required, Validators.maxLength(4)],
      location: ['', Validators.required],
      imagesUrl: this.fb.array([this.fb.control('', Validators.required)]),
    });
  }

  get imagesUrl(): FormArray {
    return this.roomForm.get('imagesUrl') as FormArray;
  }

  addImageUrl() {
    if (this.imagesUrl.length < 6) {
      this.imagesUrl.push(this.fb.control('', Validators.required));
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'You Can Add Only 5 Images Per Room',
      });
    }
  }

  removeImageUrl(index: number) {
    if (this.imagesUrl.length > 1) {
      this.imagesUrl.removeAt(index);
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'At Least One Image URL is Required',
      });
    }
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
      location: this.roomForm.value.location,
      imagesUrl: this.roomForm.value.imagesUrl,
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
