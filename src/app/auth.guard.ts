import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, catchError, map, of } from 'rxjs';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router,private userService : UserService) {}

  canActivate(): boolean {
    if (typeof localStorage === 'undefined') {
        // Handle the case where localStorage is not available
        return false;
    }

    const token = localStorage.getItem('loggedInUserRefreshToken');
    if (token) {
        // User is logged in, allow access to the route
        this.userService.refreshToken(token).subscribe(
            response => {
                // Handle the response from refreshToken if re
                console.log("goood refrech")
                localStorage.setItem('loggedInUserRefreshToken', response.data.refresh_token);

                return true
            },
            error => {
                // Handle any error that occurs during the token refresh
                console.error('Error refreshing token:', error);
                this.logout();
              
                return false;
            }
        );
        return true;
    } else {
        // User is not logged in, redirect to the login page
        //this.router.navigate(['/login']); // Replace 'login' with your actual login route
        this.logout();
        return false;
    }
}

  logout(): void {
    // Clear local storage
    localStorage.removeItem('loggedInUserToken');
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('loggedInUserRefreshToken');
    this.userService.logout(localStorage.getItem('loggedInUserToken')!).subscribe()
    window.location.href = '/login';
  }
}
