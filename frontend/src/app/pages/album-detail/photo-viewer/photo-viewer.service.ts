import { Injectable, signal, computed } from '@angular/core';

export interface ViewerPhoto {
  id: string;
  thumbPath: string;
  description?: string;
  takenAt?: any;
}

@Injectable({ providedIn: 'root' })
export class PhotoViewerService {
  photos = signal<ViewerPhoto[]>([]);
  currentIndex = signal(0);
  opened = signal(false);

  hasMore = signal(true);
  loadingMore = signal(false);

  current = computed(() => this.photos()[this.currentIndex()]);

  visibleThumbs = computed(() => {
    const idx = this.currentIndex();
    const start = Math.max(0, idx - 3);
    const end = idx + 4;
    return this.photos().slice(start, end);
  });

  open(photos: ViewerPhoto[], startIndex = 0) {
    this.photos.set(photos);
    this.currentIndex.set(startIndex);
    this.opened.set(true);
  }

  close() {
    this.opened.set(false);
  }

  next() {
    if (this.currentIndex() < this.photos().length - 1) {
      this.currentIndex.update(i => i + 1);
      this.maybeLoadMore();
    }
  }

  prev() {
    if (this.currentIndex() > 0) {
      this.currentIndex.update(i => i - 1);
    }
  }

  jumpTo(index: number) {
    this.currentIndex.set(index);
  }

  loadMore: () => Promise<void> = async () => {};

  private maybeLoadMore() {
    const remaining = this.photos().length - this.currentIndex() - 1;

    if (remaining <= 2 && this.hasMore() && !this.loadingMore()) {
      this.loadingMore.set(true);

      this.loadMore()
        .finally(() => {
          this.loadingMore.set(false);
        });
    }
  }
}
