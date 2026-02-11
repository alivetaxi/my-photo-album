import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PhotoViewerService } from './photo-viewer.service';

@Component({
  selector: 'app-photo-viewer-strip',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './photo-viewer-strip.component.html',
  styleUrl: './photo-viewer-strip.component.scss',
})
export class PhotoViewerStripComponent {
  viewer = inject(PhotoViewerService);
}
