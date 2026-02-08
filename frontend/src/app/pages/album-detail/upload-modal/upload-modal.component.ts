import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { PhotoUploadService } from './photo-upload.service';

@Component({
  standalone: true,
  selector: 'app-upload-modal',
  templateUrl: './upload-modal.component.html',
  styleUrls: ['./upload-modal.component.scss'],
})
export class UploadModalComponent {
  private uploader = inject(PhotoUploadService);

  @Input({ required: true }) albumId!: string;
  @Output() closed = new EventEmitter<void>();
  @Output() uploaded = new EventEmitter<void>();

  files = signal<File[]>([]);

  onFilesSelected(input: HTMLInputElement) {
    this.files.set(Array.from(input.files ?? []));
  }

  async upload() {
    if (this.files().length === 0) return;

    await this.uploader.uploadPhotos(this.albumId, this.files());
    this.uploaded.emit();
    this.close();
  }

  close() {
    this.files.set([]);
    this.closed.emit();
  }

  uploading = this.uploader.uploading;
  error = this.uploader.error;
}
