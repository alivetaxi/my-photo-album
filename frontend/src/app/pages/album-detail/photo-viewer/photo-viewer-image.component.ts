import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { PhotoViewerService } from './photo-viewer.service';

@Component({
  selector: 'app-photo-viewer-image',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './photo-viewer-image.component.html',
  styleUrl: './photo-viewer-image.component.scss',
})
export class PhotoViewerImageComponent {
  viewer = inject(PhotoViewerService);

  private startX = 0;

  onTouchStart(event: TouchEvent) {
    this.startX = event.touches[0].clientX;
  }

  onTouchEnd(event: TouchEvent) {
    const endX = event.changedTouches[0].clientX;
    const delta = endX - this.startX;

    if (Math.abs(delta) < 20) return;

    if (delta < 0) {
      this.viewer.next();
    } else {
      this.viewer.prev();
    }
  }
}
