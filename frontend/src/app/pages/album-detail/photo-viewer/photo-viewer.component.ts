import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { PhotoViewerService } from './photo-viewer.service';
import { PhotoViewerImageComponent } from './photo-viewer-image.component';
import { PhotoViewerStripComponent } from './photo-viewer-strip.component';

@Component({
  selector: 'app-photo-viewer',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    PhotoViewerImageComponent,
    PhotoViewerStripComponent,
  ],
  templateUrl: './photo-viewer.component.html',
  styleUrl: './photo-viewer.component.scss',
})
export class PhotoViewerComponent {
  viewer = inject(PhotoViewerService);
}
