import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UploadService {
  private readonly cloudinaryUrl = `https://api.cloudinary.com/v1_1/dnoxelx9f/image/upload`;

  constructor(private http: HttpClient) {}

  uploadImage(file: File, uploadPreset: string): Observable<any> {
    const formData = new FormData(); // includes the image file and the upload preset.
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    return this.http.post(this.cloudinaryUrl, formData);
  }
}
