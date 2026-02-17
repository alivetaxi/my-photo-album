import { Injectable, inject, signal, effect } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AuthService } from '../../core/auth/auth.service';

export interface PhotoFile {
  type: 'IMAGE' | 'VIDEO';
  sha256: string;
  gcsPath: string;
}

export interface Photo {
  id: string;
  albumId: string;
  mediaType: 'IMAGE' | 'LIVE_PHOTO' | 'VIDEO';
  files: PhotoFile[];
  thumbPath?: string;
  description?: string;
  status: 'UPLOADED' | 'READY' | 'FAILED';
  createdAt: any;
  takenAt?: any;
}

@Injectable({ providedIn: 'root' })
export class AlbumDetailService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private readonly reloadTick = signal(0);
  private readonly albumId = signal<string | null>(null);

  readonly albumTitle = signal<string | null>(null);
  readonly photos = signal<Photo[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  private readonly nextCursor = signal<string | null>(null);
  readonly hasMore = signal(true);

  constructor() {
    effect(() => {
      const albumId = this.albumId();
      this.auth.me();       // auth dependency
      this.reloadTick();    // reload dependency

      if (!albumId) return;

      this.loading.set(true);
      this.error.set(null);

      const params = new HttpParams().set('limit', 50);

      this.http
        .get<{ albumTitle: string; items: Photo[]; nextCursor?: string }>(
          `/api/albums/${albumId}/photos`,
          { params }
        )
        .subscribe({
          next: res => {
            this.albumTitle.set(res.albumTitle);
            this.photos.set(res.items);
            this.nextCursor.set(res.nextCursor ?? null);
            this.hasMore.set(!!res.nextCursor);
            this.loading.set(false);
          },
          error: () => {
            this.error.set('Failed to load photos');
            this.loading.set(false);
          },
        });
    });
  }

  setAlbum(albumId: string): void {
    this.albumId.set(albumId);
    this.photos.set([]);
    this.nextCursor.set(null);
    this.hasMore.set(true);
    this.reload();
  }

  reload(): void {
    this.reloadTick.update(v => v + 1);
  }

  loadMore(): void {
    const albumId = this.albumId();
    const cursor = this.nextCursor();

    if (!albumId || !cursor || this.loading()) return;

    this.loading.set(true);

    let params = new HttpParams()
      .set('limit', 50)
      .set('cursor', cursor);

    this.http
      .get<{ items: Photo[]; nextCursor?: string }>(
        `/api/albums/${albumId}/photos`,
        { params }
      )
      .subscribe({
        next: res => {
          this.photos.update(list => [...list, ...res.items]);
          this.nextCursor.set(res.nextCursor ?? null);
          this.hasMore.set(!!res.nextCursor);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Failed to load more photos');
          this.loading.set(false);
        },
      });
  }

  retryThumbnail(photoId: string): void {
    this.http
      .post(`/api/photos/${photoId}/retry-thumbnail`, {})
      .subscribe(() => {
        this.reload();
      });
  }
}
