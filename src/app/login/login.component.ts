import { Component } from '@angular/core';
import { UserService } from '../user.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  providers: [MessageService],
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  error: any;

  constructor(private userService: UserService) {}

  userData = {
    email: '',
    password: '',
  };
  fieldErrors: {
    [key: string]: boolean;
    email: boolean;
    password: boolean;
  } = {
    password: false,
    email: false,
  };

  showPassword: boolean = false;

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  clearError(fieldName: string): void {
    this.fieldErrors[fieldName] = false;
  }

  validateForm(): boolean {
    this.error = '';
    let isValid = true;

    if (!this.userData.email) {
      this.fieldErrors.email = true;
      isValid = false;
    } else {
      this.fieldErrors.email = false;
    }

    if (!this.userData.password) {
      this.fieldErrors.password = true;
      isValid = false;
    } else {
      this.fieldErrors.password = false;
    }

    return isValid;
  }

  onSubmit(): void {
    if (this.validateForm()) {
      this.userService.login(this.userData).subscribe(
        (response) => {
          // Store user ID and token in local storage
          localStorage.setItem('loggedInUserId', response.data.id);
          localStorage.setItem('loggedInUserToken', response.data.token);

          // Redirect to the dashboard
          window.location.href = '/';
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
