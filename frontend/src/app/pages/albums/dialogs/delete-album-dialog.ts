import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { AlbumDialogData } from './album-dialog-data';

@Component({
  selector: 'delete-album-dialog',
  templateUrl: 'delete-album-dialog.html',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogActions,
    MatDialogClose,
    MatRadioModule
  ],
})
export class DeleteAlbumDialog {
  readonly dialogRef = inject(MatDialogRef<DeleteAlbumDialog>);
  readonly data = inject<AlbumDialogData>(MAT_DIALOG_DATA);

  cancel(): void {
    this.dialogRef.close();
  }
}
