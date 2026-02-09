import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

interface UploadUrlResponse {
  uploadUrl: string;
  gcsPath: string;
}

@Injectable({ providedIn: 'root' })
export class UploadPhotoService {
  private http = inject(HttpClient);

  uploading = signal(false);
  progress = signal(0);
  error = signal<string | null>(null);

  async uploadPhotos(albumId: string, photos: File[]) {
    if (photos.length === 0) return;

    const progessPerPhoto = 100 / photos.length;

    this.uploading.set(true);
    this.progress.set(0);
    this.error.set(null);

    try {
      for (const photo of photos) {
        await this.uploadSingle(albumId, photo);
        this.progress.update(current => Math.min(current + progessPerPhoto, 100));
      }
    } catch (e) {
      console.error(e);
      this.error.set('Upload failed');
      throw e;
    } finally {
      this.uploading.set(false);
    }
  }

  private async uploadSingle(albumId: string, photo: File) {
    const sha256 = await this.calculateSha256(photo);

    const { uploadUrl, gcsPath } = await firstValueFrom(
      this.http.post<UploadUrlResponse>('/api/photos/upload-url', {
        sha256,
        contentType: photo.type,
      })
    );

    await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': photo.type,
      },
      body: photo,
    });

    await firstValueFrom(
      this.http.post('/api/photos', {
        albumId,
        mediaType: this.detectMediaType(photo),
        files: [
          {
            type: this.detectMediaType(photo),
            contentType: photo.type,
            sha256,
            gcsPath,
          },
        ],
      })
    );
  }

  private detectMediaType(file: File): 'IMAGE' | 'VIDEO' {
    return file.type.startsWith('video') ? 'VIDEO' : 'IMAGE';
  }

  private async calculateSha256(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  }
}
