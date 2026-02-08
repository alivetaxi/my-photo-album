import { Injectable, inject, signal, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/auth/auth.service';

/**
 * Album data model returned by backend.
 * Filtering (public / private) is handled by backend based on auth context.
 */
export interface Album {
  id: string;
  title: string;
  description?: string;
  isPublic: boolean;
  coverUrl?: string;
  createdAt: string; // ISO string
}

@Injectable({ providedIn: 'root' })
export class AlbumsService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private readonly apiUrl = '/api/albums';

  private readonly reloadTick = signal(0);

  readonly albums = signal<Album[] | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  constructor() {
    effect(() => {
      this.auth.me();
      this.reloadTick(); // dependency

      this.loading.set(true);
      this.error.set(null);

      this.http.get<Album[]>(this.apiUrl).subscribe({
        next: albums => {
          this.albums.set(albums);
          this.loading.set(false);
        },
        error: err => {
          this.error.set('Failed to load albums');
          this.loading.set(false);
        },
      });
    });
  }

  refresh(): void {
    this.reloadTick.update(v => v + 1);
  }

  createAlbum(payload: {
    title: string;
    isPublic: boolean;
    description?: string;
  }): void {
    this.http.post(this.apiUrl, payload).subscribe(() => {
      this.refresh();
    });
  }

  deleteAlbum(albumId: string): void {
    this.http.delete(`${this.apiUrl}/${albumId}`).subscribe(() => {
      this.refresh();
    });
  }
}
