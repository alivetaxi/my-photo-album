import { Component, inject, model } from '@angular/core';
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

export interface DialogData {
  title: string;
  isPublic: boolean;
}

@Component({
  selector: 'create-album-dialog',
  templateUrl: 'create-album-dialog.html',
  styleUrls: ['create-album-dialog.scss'],
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
export class CreateAlbumDialog {
  readonly dialogRef = inject(MatDialogRef<CreateAlbumDialog>);
  readonly data = inject<DialogData>(MAT_DIALOG_DATA);
  readonly title = model(this.data.title);
  readonly isPublic = model(this.data.isPublic);

  cancel(): void {
    this.dialogRef.close();
  }
}
