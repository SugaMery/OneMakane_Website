import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {
    if (typeof localStorage !== 'undefined') {
      if (localStorage.getItem('loggedInUserToken')) {
        // User is logged in, allow access to the route
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
    
    window.location.href = '/login';
 
  }
}
