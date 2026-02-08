import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

interface UploadUrlResponse {
  uploadUrl: string;
  gcsPath: string;
}

@Injectable({ providedIn: 'root' })
export class PhotoUploadService {
  private http = inject(HttpClient);

  uploading = signal(false);
  error = signal<string | null>(null);

  async uploadPhotos(albumId: string, files: File[]) {
    if (files.length === 0) return;

    this.uploading.set(true);
    this.error.set(null);

    try {
      for (const file of files) {
        await this.uploadSingle(albumId, file);
      }
    } catch (e) {
      console.error(e);
      this.error.set('Upload failed');
      throw e;
    } finally {
      this.uploading.set(false);
    }
  }

  private async uploadSingle(albumId: string, file: File) {
    const sha256 = await this.calculateSha256(file);

    const { uploadUrl, gcsPath } = await firstValueFrom(
      this.http.post<UploadUrlResponse>('/api/photos/upload-url', {
        sha256,
        contentType: file.type,
      })
    );

    await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: file,
    });

    await firstValueFrom(
      this.http.post('/api/photos', {
        albumId,
        mediaType: this.detectMediaType(file),
        files: [
          {
            type: this.detectMediaType(file),
            contentType: file.type,
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
