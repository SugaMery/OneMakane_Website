import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { UserService } from './user.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(private userService: UserService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('loggedInUserToken');

    if (token) {
      // Clone la requête et ajoute le token dans les en-têtes
      const cloned = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`),
      });

      return next.handle(cloned).pipe(
        catchError((error) => {
          // Si le token est expiré, tente de le renouveler avec le refresh token
          if (error.status === 401) {
            const refreshToken = localStorage.getItem(
              'loggedInUserRefreshToken'
            );
            if (refreshToken) {
              return this.userService.refreshToken(refreshToken).pipe(
                switchMap((response: any) => {
                  // Met à jour le token
                  localStorage.setItem(
                    'loggedInUserToken',
                    response.data.token
                  );
                  const clonedRetry = req.clone({
                    headers: req.headers.set(
                      'Authorization',
                      `Bearer ${response.data.token}`
                    ),
                  });
                  return next.handle(clonedRetry); // Réessaie la requête avec le nouveau token
                }),
                catchError(() => {
                  // Échec du refresh, déconnecte l'utilisateur
                  // Passe le token actuel à la méthode logout
                  this.userService.logout(token).subscribe(() => {
                    window.location.href = '/login'; // Redirige l'utilisateur
                  });
                  return next.handle(req); // Redirige vers la page de connexion
                })
              );
            }
          }
          return next.handle(req);
        })
      );
    } else {
      return next.handle(req); // Si pas de token, passe la requête sans modification
    }
  }
}
