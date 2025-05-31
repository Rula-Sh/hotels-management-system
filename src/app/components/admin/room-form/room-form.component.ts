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
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { I18nService } from '../../../services/i18n.service';
import { Room } from '../../../models/Room.model';
import { RoomService } from '../../../services/room.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { UploadService } from '../../../services/upload.service';

@Component({
  selector: 'app-add-room',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    I18nPipe,
    ToastModule,
    RouterLink,
  ],
  providers: [MessageService],
  templateUrl: './room-form.component.html',
  styleUrl: './room-form.component.scss',
})
export class RoomFormComponent {
  roomForm!: FormGroup;
  isAddingARoom = true;
  room!: any;

  images: string[] = []; // Replace FormArray with simple array
  selectedFile: File | null = null;
  currentIndex = 0;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private i18nService: I18nService,
    private roomService: RoomService,
    private messageService: MessageService,
    private activatedRoute: ActivatedRoute,
    private uploadService: UploadService
  ) {}

  get lang(): 'en' | 'ar' {
    return this.i18nService.getLanguage();
  }

  ngOnInit() {
    this.roomForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(30)]],
      roomType: ['', Validators.required],
      floor: ['', [Validators.required, Validators.maxLength(2)]],
      hotel: ['', [Validators.required, Validators.maxLength(30)]],
      details: ['', [Validators.required, Validators.maxLength(500)]],
      price: ['', [Validators.required, Validators.maxLength(4)]],
      location: ['', Validators.required],
    });

    if (this.router.url.includes('edit-room')) {
      this.isAddingARoom = false;
      const roomId = this.activatedRoute.snapshot.paramMap.get('id');
      if (roomId) {
        this.roomService.getRoomById(roomId).subscribe({
          next: (roomData) => {
            this.room = roomData;
            this.roomForm.patchValue(roomData);
            this.images = [...roomData.imagesUrl]; // Load old images
          },
        });
      }
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    this.selectedFile = file;

    this.uploadService.uploadImage(file, 'HMS - IIH Project').subscribe({
      next: (res: any) => {
        this.images.push(res.url);
        this.selectedFile = null;
      },
      error: (err) => {
        console.error('Upload error', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to upload image',
        });
      },
    });
  }

  removeImage(index: number) {
    this.images.splice(index, 1);
    if (this.currentIndex >= this.images.length) {
      this.currentIndex = Math.max(this.images.length - 1, 0);
    }
  }

  nextImage() {
    if (this.images.length === 0) return;
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
  }

  prevImage() {
    if (this.images.length === 0) return;
    this.currentIndex =
      (this.currentIndex - 1 + this.images.length) % this.images.length;
  }

  slide(): string {
    return `translateX(-${this.currentIndex * 100}%)`;
  }

  submit() {
    if (this.roomForm.invalid) {
      this.roomForm.markAllAsTouched();
      return;
    }

    if (this.images.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'At least one image is required',
      });
      return;
    }

    const roomData: Room = {
      ...this.roomForm.value,
      imagesUrl: this.images,
      bookedStatus: this.isAddingARoom ? 'Available' : this.room.bookedStatus,
      id: this.room?.id ?? undefined,
    };

    const action = this.isAddingARoom
      ? this.roomService.CreateRoom(roomData)
      : this.roomService.updateRoom(this.room.id, roomData);

    action.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: this.isAddingARoom
            ? 'Room added successfully'
            : 'Room updated successfully',
        });
        setTimeout(() => {
          this.router.navigate(['/rooms']);
        }, 1500);
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Something went wrong',
        });
      },
    });
  }
}
