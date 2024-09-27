import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private userService: UserService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }

    const token = localStorage.getItem('loggedInUserToken');
    const refreshToken = localStorage.getItem('loggedInUserRefreshToken');

    // Vérifie si le token est expiré
    if (token && this.userService.isTokenExpired(token)) {
      if (refreshToken) {
        this.userService.refreshToken(refreshToken).subscribe(
          (response) => {
            // Stocke le nouveau token
            localStorage.setItem('loggedInUserToken', response.data.token);
            return true; // Permet l'accès car le token a été rafraîchi
          },
          (error) => {
            this.handleLogout(); // Échec du rafraîchissement, déconnexion
            return false;
          }
        );
      } else {
        localStorage.setItem('redirectUrl', state.url);
        this.logout(); // Pas de refresh token, déconnexion
        return false;
      }
    } else if (!token) {
      localStorage.setItem('redirectUrl', state.url);
      this.logout(); // Pas de token, déconnexion
      return false;
    }
    return true; // Token valide, permet l'accès
  }

  logout(): void {
    const token = localStorage.getItem('loggedInUserToken');

    // Supprime les informations de connexion du stockage local
    localStorage.removeItem('loggedInUserToken');
    localStorage.removeItem('loggedInUserId');
    localStorage.removeItem('loggedInUserRefreshToken');

    if (token) {
      this.userService.logout(token).subscribe(
        () => {
          window.location.href = '/login'; // Redirection vers la page de login
        },
        (error) => {
          console.error('Erreur lors de la déconnexion:', error);
          window.location.href = '/login';
        }
      );
    } else {
      window.location.href = '/login'; // Redirection si aucun token
    }
  }

  handleLogout(): void {
    localStorage.removeItem('loggedInUserToken');
    localStorage.removeItem('loggedInUserRefreshToken');
    localStorage.removeItem('loggedInUserId');
    window.location.href = '/login';
  }
}
