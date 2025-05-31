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
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { I18nService } from '../../../services/i18n.service';
import { Room } from '../../../models/Room.model';
import { RoomService } from '../../../services/room.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { UploadService } from '../../../services/upload.service';
import { forkJoin } from 'rxjs';

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

  selectedFiles: File[] = [];
  uploadPreset = 'HMS - IIH Project';

  get lang(): 'en' | 'ar' {
    return this.i18nService.getLanguage();
  }

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private i18nService: I18nService,
    private roomService: RoomService,
    private messageService: MessageService,
    private activatedRoute: ActivatedRoute,
    private uploadService: UploadService
  ) {}

  ngOnInit() {
    if (this.router.url.includes('edit-room')) {
      this.isAddingARoom = false;

      var roomId = this.activatedRoute.snapshot.paramMap.get('id');
      if (roomId) {
        this.roomService.getRoomById(roomId).subscribe({
          next: (value) => {
            this.room = value;
            console.log('Recieved Room Details');
            this.loadRoom();
          },
          error: (err) => {
            console.log('Error Loading Room Details:', err);
          },
        });
      }
    }

    this.roomForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(30)]],
      roomType: ['', Validators.required],
      floor: ['', [Validators.required, Validators.maxLength(2)]],
      hotel: ['', [Validators.required, Validators.maxLength(30)]],
      details: ['', [Validators.required, Validators.maxLength(500)]],
      price: ['', [Validators.required, Validators.maxLength(4)]],
      location: ['', Validators.required],
      imagesUrl: this.fb.array(
        this.isAddingARoom ? [this.fb.control('', Validators.required)] : []
      ),
    });
  }

  loadRoom() {
    const roomData = {
      title: this.room.title,
      roomType: this.room.roomType,
      floor: this.room.floor,
      hotel: this.room.hotel,
      details: this.room.details,
      price: this.room.price,
      location: this.room.location,
    };

    this.roomForm.patchValue(roomData);

    // to show the room images on edit room
    const imagesArray = this.roomForm.get('imagesUrl') as FormArray;

    this.room.imagesUrl.forEach((url: string) => {
      imagesArray.push(this.fb.control(url, Validators.required));
    });
  }

  get imagesUrl(): FormArray {
    // used to get the imagesUrl form control as a strongly typed FormArray, so i don’t have to repeatedly write: this.roomForm.get('imagesUrl') as FormArray
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

  onFileSelected(event: any, index: number) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFiles[index] = file;
    }
  }

  submit() {
    const controls = this.roomForm.controls;
    let isInvalidExcludingImages = false;

    for (let key in controls) {
      if (key !== 'imagesUrl' && controls[key].invalid) {
        controls[key].markAsTouched();
        isInvalidExcludingImages = true;
      }
    }

    if (isInvalidExcludingImages) {
      return;
    }

    if (!this.selectedFiles.length) {
      this.roomForm.markAllAsTouched();
      return;
    }

    // Upload the images first
    const uploadObservables = this.selectedFiles.map((file) =>
      this.uploadService.uploadImage(file, this.uploadPreset)
    );

    forkJoin(uploadObservables).subscribe({
      next: (responses) => {
        const uploadedUrls = responses.map((res: any) => res.url);
        const imagesFormArray = this.roomForm.get('imagesUrl') as FormArray;

        // Clear and repopulate FormArray
        imagesFormArray.clear();
        uploadedUrls.forEach((url) =>
          imagesFormArray.push(this.fb.control(url, Validators.required))
        );

        this.createRoom();
      },
      error: (err) => {
        console.error('Error uploading images', err);
      },
    });
  }

  createRoom() {
    if (this.isAddingARoom) {
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
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Room Added successfully',
          });
          setTimeout(() => {
            this.router.navigate(['/rooms']);
            this.roomForm.reset();
          }, 1500);
        },
        error: (err) => {
          console.log('Error on Adding a Room', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to add room',
          });
        },
      });
    } else {
      const updatedRoom: Room = {
        id: this.room.id,
        title: this.roomForm.value.title,
        roomType: this.roomForm.value.roomType,
        floor: this.roomForm.value.floor,
        hotel: this.roomForm.value.hotel,
        details: this.roomForm.value.details,
        bookedStatus: this.room.bookedStatus,
        price: this.roomForm.value.price,
        location: this.roomForm.value.location,
        imagesUrl: this.roomForm.value.imagesUrl,
      };
      this.roomService.updateRoom(this.room.id, updatedRoom).subscribe({
        next: () => {
          console.log('Room updated successfully');
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Room updated successfully',
          });
          setTimeout(() => {
            this.router.navigate(['/rooms']);
            this.roomForm.reset();
          }, 1500);
        },
        error: (err) => {
          console.log('Error on Updating Room', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to update room',
          });
        },
      });
    }
  }
}
