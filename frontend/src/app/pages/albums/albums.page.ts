import { Component, inject, computed } from '@angular/core';
import { Router } from '@angular/router';

import { AlbumsService, Album } from './albums.service';
import { AuthService } from '../../core/auth/auth.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { CreateAlbumDialog } from './dialogs/create-album-dialog';
import { DeleteAlbumDialog } from './dialogs/delete-album-dialog';

@Component({
  standalone: true,
  selector: 'albums-page',
  templateUrl: './albums.page.html',
  styleUrls: ['./albums.page.scss'],
  imports: [MatCardModule, MatButtonModule, MatGridListModule, MatIconModule],
})
export class AlbumsPage {
  private router = inject(Router);
  private albumsService = inject(AlbumsService);
  private auth = inject(AuthService);

  readonly albums = this.albumsService.albums;
  readonly loading = this.albumsService.loading;
  readonly error = this.albumsService.error;

  readonly isAdmin = computed(() => this.auth.isAdmin());

  readonly dialog = inject(MatDialog);

  createAlbum(): void {
    const dialogRef = this.dialog.open(CreateAlbumDialog, {
      data: { title: '', isPublic: false },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        this.albumsService.createAlbum({ title: result.title, isPublic: result.isPublic });
      }
    });
  }

  deleteAlbum(album: Album): void {
    const dialogRef = this.dialog.open(DeleteAlbumDialog, {
      data: { title: album.title, photoCount: album.photoCount },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        this.albumsService.deleteAlbum(album.id);
      }
    });
  }

  open(album: Album): void {
    this.router.navigate(['/albums', album.id]);
  }
}
