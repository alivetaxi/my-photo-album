import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  computed,
  effect,
  HostListener
} from '@angular/core';
import { PhotoViewerImageComponent } from './photo-viewer-image.component';

@Component({
  selector: 'app-photo-viewer',
  standalone: true,
  templateUrl: './photo-viewer.component.html',
  styleUrls: ['./photo-viewer.component.scss'],
  imports: [PhotoViewerImageComponent],
})
export class PhotoViewerComponent {
  @Input({ required: true }) photos!: any[];
  @Input({ required: true }) startIndex!: number;

  @Output() close = new EventEmitter<void>();
  @Output() indexChange = new EventEmitter<number>();

  private index = signal(0);

  currentPhoto = computed(() => this.photos[this.index()]);
  hasPrev = computed(() => this.index() > 0);
  hasNext = computed(() => this.index() < this.photos.length - 1);

  constructor() {
    effect(() => {
      this.indexChange.emit(this.index());
    });
  }

  ngOnInit() {
    this.index.set(this.startIndex);
    document.body.style.overflow = 'hidden'; // lock scroll
  }

  ngOnDestroy() {
    document.body.style.overflow = '';
  }

  prev() {
    if (this.hasPrev()) this.index.update(i => i - 1);
  }

  next() {
    if (this.hasNext()) this.index.update(i => i + 1);
  }

  closeViewer() {
    this.close.emit();
  }

  // keyboard support
  @HostListener('window:keydown', ['$event'])
  onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') this.closeViewer();
    if (e.key === 'ArrowLeft') this.prev();
    if (e.key === 'ArrowRight') this.next();
  }
}
