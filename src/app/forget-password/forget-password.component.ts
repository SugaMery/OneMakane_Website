import { ChangeDetectorRef, Component, HostListener } from '@angular/core';
import { UserService } from '../user.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrl: './forget-password.component.css'
})
export class ForgetPasswordComponent {
  email: string = '';
  password: string = '';
  error: any;

  constructor(
    private router: Router,
    private userService: UserService,
    private jwtHelper: JwtHelperService
  ) {}

  userData = {
    email: '',
  };
  fieldErrors: {
    [key: string]: boolean;
    email: boolean;
  } = {
    email : false,
  };

 

  clearError(fieldName: string): void {
    this.fieldErrors[fieldName] = false;
  }

  
  validateForm(): boolean {
    this.error="";
    let isValid = true;

    if (!this.userData.email) {
      this.fieldErrors.email = true;
      isValid = false;
    } else {
      this.fieldErrors.email = false;
    }
    return isValid;
  }
  
  onSubmit(): void {
    if(this.validateForm()){
      this.userService.sendResetEmail(this.userData.email).subscribe(
        (response) => {
          // Store user ID and token in local storage
          // Redirect to the dashboard
          window.location.href = '/reset-password/email';
        },
        (error) => {
          // Handle login error
          
          this.error = error;
          console.error(error);
        }
      );
    }
 
  }
}
