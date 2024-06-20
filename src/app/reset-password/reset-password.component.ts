import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../user.service';
import { error } from 'console';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css',
})
export class ResetPasswordComponent {
  userId!: string;
  passwordToken!: string;

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.userId = params['user_id'];
      this.passwordToken = params['password_token'];
      console.log('user', this.userId);
    });
  }

  userData = {
    password: '',
    repeat_password: '',
  };

  fieldErrors: {
    [key: string]: boolean;
    password: boolean;
    repeat_password: boolean;
    repeat_passwords: boolean;
    passwordMismatch: boolean;
  } = {
    password: false,
    repeat_password: false,
    repeat_passwords: false,
    passwordMismatch: false,
  };

  constructor(
    private router: Router,
    private userService: UserService,
    private route: ActivatedRoute
  ) {}

  validateForm(): boolean {
    this.error = '';
    let isValid = true;

    if (!this.userData.password) {
      this.fieldErrors.password = true;
      isValid = false;
    } else {
      this.fieldErrors.password = false;
    }

    if (!this.userData.repeat_password) {
      this.fieldErrors.repeat_password = true;
      isValid = false;
    } else {
      this.fieldErrors.repeat_password = false;
    }

    // Check if passwords match
    if (!this.fieldErrors.password && !this.fieldErrors.repeat_password) {
      if (this.userData.password !== this.userData.repeat_password) {
        this.fieldErrors.passwordMismatch = true;
        isValid = false;
      } else {
        this.fieldErrors.passwordMismatch = false;
      }
    } else {
      this.fieldErrors.passwordMismatch = false;
    }

    // If all fields are filled, allow to proceed to the next step
    return isValid;
  }

  showPassword: boolean = false;

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  showRepeatPassword: boolean = false;

  toggleRepeatPasswordVisibility(): void {
    this.showRepeatPassword = !this.showRepeatPassword;
  }

  visible: boolean = true;
  changetype: boolean = true;
  error: any;
  viewpass() {
    this.visible = !this.visible;
    this.changetype = !this.changetype;
  }

  clearError(fieldName: string): void {
    this.fieldErrors[fieldName] = false;
  }

  onSubmit(): void {
    if (this.validateForm()) {
      this.userService
        .resetPassword(
          this.userId,
          this.passwordToken,
          this.userData.password,
          this.userData.repeat_password
        )
        .subscribe(
          (data) => {
            window.location.href = '/login';
          },
          (error) => {
            // Handle registration error
            this.error = error;
            /* 
              this.userData= {
                password:'',
                repeat_password:''
              } */
          }
        );
    }
  }
}
