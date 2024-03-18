import { ChangeDetectorRef, Component, HostListener } from '@angular/core';
import { UserService } from '../user.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  providers: [MessageService]
})
export class LoginComponent {
  
  email: string = '';
  password: string = '';

  constructor(
    private router: Router,
    private userService: UserService,
    private jwtHelper: JwtHelperService
  ) {}


  onSubmit(): void {
    this.userService.login(this.email, this.password).subscribe(
      response => {
        // Handle successful login response
        localStorage.setItem('loggedInUserToken', response.token);
        const decodedToken = this.jwtHelper.decodeToken(response.token);
        localStorage.setItem('loggedInUser', JSON.stringify(decodedToken.userId));
        console.log('User information:', decodedToken.userId);
        
        // Redirect to the dashboard
        this.router.navigate(['/']); // Update 'dashboard' with your actual route
      },
      error => {
        // Handle login error
        console.error(error);
      }
    );
  }
  
  
  


}
