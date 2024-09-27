import { Component } from '@angular/core';
import { UserService } from '../user.service';
import { CategoryService } from '../category.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  error: any;

  constructor(
    private userService: UserService,
    private categoryService: CategoryService
  ) {}

  categories: any[] = [];
  Souscategories: any[] = [];

  ngOnInit() {
    this.fetchCategories();
  }

  fetchCategories(): void {
    const accessToken = localStorage.getItem('loggedInUserToken');
    if (!accessToken) {
      return;
    }

    this.categoryService.getCategoriesFrom().subscribe(
      (categories) => {
        this.categories = categories.data.filter(
          (category: any) =>
            category.active === true && category.parent_id !== null
        );
      },
      (error) => {
        console.error('Error fetching categories: ', error);
      }
    );
  }

  userData = {
    email: '',
    password: '',
  };

  fieldErrors: { [key: string]: boolean; email: boolean; password: boolean } = {
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
          localStorage.removeItem('loggedInUserToken');
          localStorage.removeItem('loggedInUser');
          localStorage.removeItem('loggedInUserRefreshToken');

          localStorage.setItem('loggedInUserId', response.data.id);
          localStorage.setItem('loggedInUserToken', response.data.token);
          localStorage.setItem(
            'loggedInUserRefreshToken',
            response.data.refresh_token
          );

          const redirectUrl = localStorage.getItem('redirectUrl') || '/';
          localStorage.removeItem('redirectUrl');
          window.location.href = redirectUrl;
        },
        (error) => {
          this.error = error;
          console.error(error);
        }
      );
    }
  }
}
