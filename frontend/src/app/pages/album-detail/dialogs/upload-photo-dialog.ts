import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { UploadPhotoService } from './upload-photo.service';

@Component({
  selector: 'upload-photo-dialog',
  templateUrl: 'upload-photo-dialog.html',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogActions,
    MatProgressBarModule
  ],
})
export class UploadPhotoDialog {
  private service = inject(UploadPhotoService);
  
  readonly dialogRef = inject(MatDialogRef<UploadPhotoDialog>);
  readonly data = inject<{ albumId: string }>(MAT_DIALOG_DATA);
  readonly photos = signal<File[]>([]);

  readonly progress = this.service.progress;
  readonly uploading = this.service.uploading;

  onPhotosSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.photos.set(Array.from(input.files));
    }
  }

  async upload() {
    if (this.photos().length === 0) return;

    await this.service.uploadPhotos(this.data.albumId, this.photos());
    this.photos.set([]);
    this.dialogRef.close(this.data.albumId);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
