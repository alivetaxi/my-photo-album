import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-photo-viewer-image',
  standalone: true,
  template: `
    <img
      [src]="src"
      class="image"
      loading="eager"
    />
  `,
  styles: [`
    .image {
      max-width: 100vw;
      max-height: 100vh;
      object-fit: contain;
    }
  `]
})
export class PhotoViewerImageComponent {
  @Input({ required: true }) photo!: any;

  get src() {
    return `/api/photos/${this.photo.id}`;
  }
}
