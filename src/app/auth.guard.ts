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

    const token = localStorage.getItem('loggedInUserRefreshToken');
    if (token) {
      this.userService.refreshToken(token).subscribe(
        (response) => {
          // Met à jour le token de rafraîchissement dans le stockage local
          localStorage.setItem(
            'loggedInUserRefreshToken',
            response.data.refresh_token
          );
        },
        (error) => {
          // En cas d'erreur, déconnecte l'utilisateur
          this.handleLogout();
        }
      );
      return true; // Permet l'accès à la route
    } else {
      // Stocke l'URL de la page demandée pour redirection après connexion
      localStorage.setItem('redirectUrl', state.url);
      this.logout();
      return false;
    }
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
          // Redirige vers la page de connexion
          window.location.href = '/login';
        },
        (error) => {
          console.error('Erreur lors de la déconnexion:', error);
          // Redirige vers la page de connexion même en cas d'échec de la déconnexion
          window.location.href = '/login';
        }
      );
    } else {
      // Redirige vers la page de connexion si aucun token n'est trouvé
      window.location.href = '/login';
    }
  }

  handleLogout(): void {
    localStorage.removeItem('loggedInUserToken');
    localStorage.removeItem('loggedInUserRefreshToken');
    localStorage.removeItem('loggedInUserId');
    window.location.href = '/login';
  }
}
