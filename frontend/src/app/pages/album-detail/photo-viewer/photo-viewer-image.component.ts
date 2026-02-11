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

  onPointerDown(e: PointerEvent) {
    this.startX = e.clientX;
  }

  onPointerUp(e: PointerEvent) {
    const delta = e.clientX - this.startX;
    if (Math.abs(delta) < 40) return;
    delta < 0 ? this.viewer.next() : this.viewer.prev();
  }
}
