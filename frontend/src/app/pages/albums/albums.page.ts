import { Component, inject, computed } from '@angular/core';
import { Router } from '@angular/router';

import { AlbumsService, Album } from './albums.service';
import { AuthService } from '../../core/auth/auth.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';

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

  createAlbum(): void {
    const title = prompt('Album title');
    if (!title) return;

    const isPublic = confirm('Make this album public?');
    this.albumsService.createAlbum({ title, isPublic });
  }

  deleteAlbum(album: Album): void {
    if (!confirm(`Delete album "${album.title}"?`)) return;
    this.albumsService.deleteAlbum(album.id);
  }

  open(album: Album): void {
    this.router.navigate(['/albums', album.id]);
  }
}
