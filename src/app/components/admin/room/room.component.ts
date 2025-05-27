import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { I18nPipe } from '../../../pipes/i18n.pipe';
import { RoomService } from '../../../services/room.service';
import { I18nService } from '../../../services/i18n.service';
import { Room } from '../../../models/Room.model';

@Component({
  selector: 'app-room',
  imports: [CommonModule, I18nPipe],
  templateUrl: './room.component.html',
  styleUrl: './room.component.scss',
})
export class RoomComponent {
  room: Room | undefined;
  images: string[] = []; // Should be populated appropriately
  currentIndex: number = 0;
  fadeOut = false;

  get lang(): 'en' | 'ar' {
    return this.i18nService.getLanguage();
  }

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private roomService: RoomService,
    private i18nService: I18nService
  ) {}

  ngOnInit() {
    this.getRoom();
  }

  getRoom() {
    const roomId = this.activatedRoute.snapshot.paramMap.get('id');

    if (roomId) {
      this.roomService.getRoomById(roomId).subscribe({
        next: (value) => {
          this.room = value;
          this.images = this.room?.imagesUrl || [];
          console.log('Room Loaded');
        },
        error: (err) => {
          console.log('Error Retrieving the Room: ' + err);
        },
      });
    } else {
      console.log('Room ID is null');
    }
  }

  get currentImageUrl(): string {
    return (
      this.room?.imagesUrl[this.currentIndex] ||
      '../../../../../assets/images/default-room-image.jpg'
    );
  }

  nextImage() {
    if (this.images.length === 0) return;
    this.fadeOut = true;
    setTimeout(() => {
      this.currentIndex = (this.currentIndex + 1) % this.images.length;
      this.fadeOut = false;
    }, 500);
  }

  prevImage() {
    if (this.images.length === 0) return;
    this.fadeOut = true;
    setTimeout(() => {
      this.currentIndex =
        (this.currentIndex - 1 + this.images.length) % this.images.length;
      this.fadeOut = false;
    }, 500);
  }

  slide(): string {
    return `translateX(-${this.currentIndex * 100}%)`;
  }

  goBack() {
    this.router.navigate(['/rooms']);
  }
}
