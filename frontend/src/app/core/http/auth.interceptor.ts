import { inject } from '@angular/core';
import {
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest
} from '@angular/common/http';
import { Auth } from '@angular/fire/auth';
import { from, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  // Only attach token for backend API
  if (!req.url.startsWith('/api')) {
    return next(req);
  }

  const firebaseAuth = inject(Auth);

  const user = firebaseAuth.currentUser;
  if (!user) {
    return next(req);
  }

  return from(user.getIdToken()).pipe(
    switchMap(token => {
      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return next(authReq);
    })
  );
};
