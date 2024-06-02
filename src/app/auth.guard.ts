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
    if (typeof localStorage !== 'undefined') {
      if (localStorage.getItem('loggedInUserToken')) {
        // User is logged in, allow access to the route
        this.userService.refreshToken(localStorage.getItem('loggedInUserToken')!).subscribe
        return true;
      } else {
        // User is not logged in, redirect to the login page
        this.router.navigate(['/login']); // Replace 'login' with your actual login route
        return false;
      }

      return true; // Ou false selon votre logique d'authentification
    } else {
      // Gérez le cas où localStorage n'est pas disponible
      return false;
    }
  }
  logout(): void {
    // Clear local storage
    localStorage.removeItem('loggedInUserToken');
    localStorage.removeItem('loggedInUser');
    this.userService.logout(localStorage.getItem('loggedInUserToken')!).subscribe()
    window.location.href = '/login';
  }
}
