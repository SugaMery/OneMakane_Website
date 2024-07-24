import { Component } from '@angular/core';
import { UserService } from '../user.service';
import { MessageService } from 'primeng/api';
import { CategoryService } from '../category.service';
import { LanguageService } from '../language.service';

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

  constructor(
    private userService: UserService,
    private categoryService: CategoryService,
    private languageService: LanguageService
  ) {}
  categories: any[] = [];
  Souscategories: any[] = [];
  currentLanguage!: string;

  setLanguage(language: string) {
    this.languageService.setLanguage(language);
    this.currentLanguage = language;
  }

  ngOnInit() {
    this.currentLanguage = this.languageService.getCurrentLanguage();
    this.fetchCategories();
  }

  allcategories: any[] = [];
  fetchCategories(): void {
    if (typeof localStorage === 'undefined') {
      console.error('localStorage is not available.');
      return;
    }

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
        for (let i = 0; i < this.categories.length; i++) {
          const parentId = this.categories[i].parent_id?.toString();
          const Id = this.categories[i].id?.toString();
          if (!parentId) {
            continue;
          }
          // Additional logic here if needed
        }
      },
      (error) => {
        console.error('Error fetching categories: ', error);
      }
    );

    console.log('categories categories', this.categories);
  }

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
          // Clear local storage
          localStorage.removeItem('loggedInUserToken');
          localStorage.removeItem('loggedInUser');
          localStorage.removeItem('loggedInUserRefreshToken');

          // Store user ID and token in local storage
          localStorage.setItem('loggedInUserId', response.data.id);
          localStorage.setItem('loggedInUserToken', response.data.token);
          localStorage.setItem(
            'loggedInUserRefreshToken',
            response.data.refresh_token
          );

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
