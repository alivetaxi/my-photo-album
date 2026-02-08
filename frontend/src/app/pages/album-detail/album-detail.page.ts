import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AlbumDetailService, Photo } from './album-detail.service';
import { AuthService } from '../../core/auth/auth.service';
import { UploadModalComponent } from './upload-modal/upload-modal.component';
import { PhotoViewerComponent } from './photo-viewer/photo-viewer.component';

@Component({
  standalone: true,
  selector: 'album-detail-page',
  templateUrl: './album-detail.page.html',
  imports: [UploadModalComponent, PhotoViewerComponent],
})
export class AlbumDetailPage {
  private route = inject(ActivatedRoute);
  readonly service = inject(AlbumDetailService);
  readonly auth = inject(AuthService);

  readonly albumId = this.route.snapshot.paramMap.get('albumId')!;

  showUpload = signal(false);
  selectedIndex = signal<number | null>(null);

  constructor() {
    this.service.setAlbum(this.albumId);
  }

  canRetry(photo: Photo): boolean {
    return (
      this.auth.isAdmin() &&
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

  openOriginal(photo: Photo): void {
    const image = photo.files.find(f => f.type === 'IMAGE');
    if (!image) return;

    // v1: assume originals are directly accessible
    window.open(`/storage/${image.gcsPath}`, '_blank');
  }

  openUpload() {
    this.showUpload.set(true);
  }

  closeUpload() {
    this.showUpload.set(false);
  }

  onUploaded() {
    this.service.reload();
  }

  openViewer(i: number) {
    this.selectedIndex.set(i);
  }

  closeViewer() {
    this.selectedIndex.set(null);
  }
}
