import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
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

  canActivate(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      // Handle the case where the code is not running in the browser
      return false;
    }

    const token = localStorage.getItem('loggedInUserRefreshToken');
    if (token) {
      // User is logged in, allow access to the route
      this.userService.refreshToken(token).subscribe(
        (response) => {
          // Handle the response from refreshToken
          console.log('Token refreshed successfully');
          localStorage.setItem(
            'loggedInUserRefreshToken',
            response.data.refresh_token
          );
        },
        (error) => {
          // Handle any error that occurs during the token refresh
          console.error('Error refreshing token:', error);
          localStorage.removeItem('loggedInUserToken');
          localStorage.removeItem('loggedInUserId');
          localStorage.removeItem('loggedInUserRefreshToken');

          this.logout(); // This will also redirect to login
        }
      );
      return true; // Allow access while token is being refreshed
    } else {
      // User is not logged in, redirect to the login page
      this.logout();
      return false;
    }
  }

  logout(): void {
    const token = localStorage.getItem('loggedInUserToken');

    // Clear local storage
    localStorage.removeItem('loggedInUserToken');
    localStorage.removeItem('loggedInUserId');
    localStorage.removeItem('loggedInUserRefreshToken');

    if (token) {
      this.userService.logout(token).subscribe(
        () => {
          window.location.href = '/login';
        },
        (error) => {
          console.error('Error during logout:', error);
          window.location.href = '/login'; // Navigate to login even if logout API call fails
        }
      );
    } else {
      window.location.href = '/login';
    }
  }
}
