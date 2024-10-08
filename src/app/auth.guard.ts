import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { UserService } from './user.service';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

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
        // Rafraîchir le token si le refresh_token est valide
        return this.refreshAccessToken(refreshToken, state.url);
      } else {
        this.logoutWithRedirect(state.url); // Pas de refresh_token, déconnexion
        return false;
      }
    } else if (!token) {
      this.logoutWithRedirect(state.url); // Pas de token, déconnexion
      return false;
    }
    return true; // Token valide, accès autorisé
  }

  refreshAccessToken(refreshToken: string, redirectUrl: string): boolean {
    this.userService.refreshToken(refreshToken).subscribe(
      (response) => {
        // Stocker le nouveau token
        localStorage.setItem('loggedInUserToken', response.data.token);
        // Redirection à l'URL demandée après avoir rafraîchi le token
        this.router.navigateByUrl(redirectUrl);
        return true;
      },
      (error) => {
        console.error('Erreur lors du rafraîchissement du token', error);
        this.logoutWithRedirect(redirectUrl); // Si le rafraîchissement échoue, déconnexion
        return false;
      }
    );
    return false; // Pendant l'appel HTTP, l'accès est bloqué jusqu'à la réponse
  }

  logoutWithRedirect(redirectUrl: string): void {
    localStorage.setItem('redirectUrl', redirectUrl);
    this.logout();
  }

  logout(): void {
    const token = localStorage.getItem('loggedInUserToken');
    localStorage.clear(); // Supprime toutes les infos de session

    if (token) {
      this.userService.logout(token).subscribe(
        () => (window.location.href = '/login'),
        (error) => {
          console.error('Erreur lors de la déconnexion:', error);
          window.location.href = '/login';
        }
      );
    } else {
      window.location.href = '/login';
    }
  }
}
