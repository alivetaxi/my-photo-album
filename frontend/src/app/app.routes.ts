import { Routes } from '@angular/router';
import { AlbumsPage } from './pages/albums/albums.page';
import { AlbumDetailPage } from './pages/album-detail/album-detail.page';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'albums',
    pathMatch: 'full',
  },
  {
    path: 'albums',
    component: AlbumsPage,
  },
  {
    path: 'albums/:albumId',
    component: AlbumDetailPage,
  },
];
