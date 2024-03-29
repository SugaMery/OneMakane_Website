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

  userData = {
    email: '',
    password: ''
  };


  
  onSubmit(): void {
    this.userData.email = this.email;
    this.userData.password = this.password;
    this.userService.login(this.userData).subscribe(
      response => {

      // Store user ID and token in local storage
      localStorage.setItem('loggedInUserId', response.data.id);
      localStorage.setItem('loggedInUserToken', response.data.token);

        // Redirect to the dashboard
        window.location.href = '/';
      },
      error => {
        // Handle login error
        console.error(error);
      }
    );
  }
  
  
  


}
