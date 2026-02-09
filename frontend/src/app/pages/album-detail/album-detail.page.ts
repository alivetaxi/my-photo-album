import { Component, inject, signal, computed } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AlbumDetailService, Photo } from './album-detail.service';
import { AuthService } from '../../core/auth/auth.service';
import { PhotoViewerComponent } from './photo-viewer/photo-viewer.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { UploadPhotoDialog } from './dialogs/upload-photo-dialog';

@Component({
  standalone: true,
  selector: 'album-detail-page',
  templateUrl: './album-detail.page.html',
  styleUrls: ['./album-detail.page.scss'],
  imports: [
    PhotoViewerComponent,
    MatCardModule,
    MatButtonModule,
    MatGridListModule,
    MatIconModule
  ]
})
export class AlbumDetailPage {
  private route = inject(ActivatedRoute);
  readonly service = inject(AlbumDetailService);
  readonly auth = inject(AuthService);

  readonly albumId = this.route.snapshot.paramMap.get('albumId')!;

  readonly photos = this.service.photos;
  readonly albumTitle = this.service.albumTitle;
  readonly isAdmin = computed(() => this.auth.isAdmin());
  readonly loading = this.service.loading;
  readonly error = this.service.error;
  readonly hasMore = this.service.hasMore;

  readonly dialog = inject(MatDialog);

  selectedIndex = signal<number | null>(null);

  constructor() {
    this.service.setAlbum(this.albumId);
  }

  canRetry(photo: Photo): boolean {
    return (
      this.isAdmin() &&
      photo.status === 'FAILED' &&
      photo.mediaType !== 'VIDEO'
    );
  }

  retryThumbnail(photo: Photo): void {
    this.service.retryThumbnail(photo.id);
  }

  loadMore(): void {
    this.service.loadMore();
  }

  uploadPhotos() {
    const dialogRef = this.dialog.open(UploadPhotoDialog, {
      data: { albumId: this.albumId },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.service.reload();
      }
    });
  }

  openViewer(i: number) {
    this.selectedIndex.set(i);
  }

  closeViewer() {
    this.selectedIndex.set(null);
  }
}
