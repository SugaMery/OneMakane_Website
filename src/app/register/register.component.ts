import { Component, HostListener } from '@angular/core';
import { UserService } from '../user.service';

import { Router } from '@angular/router';
import { CategoryService } from '../category.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  userData = {
    first_name: '',
    last_name: '',
    email: '',
    address: '',
    postal_code: '',
    telephone: '',
    city: '',
    civility: '',
    password: '',
    role_id: 4,
    repeat_password: '',
    professional: {},
    generatedSecurityCode: this.generateSecurityCode(),
    enteredSecurityCode: '',
    termsAccepted: false,
  };

  userDataPro = {
    company_name: '',
    company_address: '',
    company_postal_code: '',
    activity_sector: '',
    contact_first_name: '',
    ice: '',
    company_address_rest: '',
    company_city: '',
    contact_email: '',
    contact_last_name: '',
  };

  fieldErrors: {
    [key: string]: boolean;
    first_name: boolean;
    last_name: boolean;
    email: boolean;
    address: boolean;
    postal_code: boolean;
    telephone: boolean; // Add category field,
    city: boolean;
    civility: boolean;
    password: boolean;
    repeat_password: boolean;
    termsAccepted: boolean;
    enteredSecurityCode: boolean;
    repeat_passwords: boolean;
    passwordMismatch: boolean;
    emailExists: boolean;

    company_name: boolean;
    company_address: boolean;
    company_postal_code: boolean;
    activity_sector: boolean;
    contact_first_name: boolean;
    ice: boolean;
    company_address_rest: boolean;
    company_city: boolean;
    contact_email: boolean;
    contact_last_name: boolean;
    security_code_incorect: boolean;
  } = {
    first_name: false,
    last_name: false,
    email: false,
    address: false,
    postal_code: false,
    telephone: false,
    ville: false,
    code_postal: false,
    city: false,
    civility: false,
    password: false,
    repeat_password: false,
    termsAccepted: false,
    enteredSecurityCode: false,
    repeat_passwords: false,
    emailExists: false,
    passwordMismatch: false,

    company_name: false,
    company_address: false,
    company_postal_code: false,
    activity_sector: false,
    contact_first_name: false,
    ice: false,
    company_address_rest: false,
    company_city: false,
    contact_email: false,
    contact_last_name: false,
    security_code_incorect: false,
  };

  showProfessionalAccount: boolean = false;
  toggleProfessionalAccount() {
    this.showProfessionalAccount = !this.showProfessionalAccount;
  }
  toggleParticulierAccount() {
    this.showProfessionalAccount = false;
  }

  optionsVisible: boolean = false;
  selectedOption: string | null = null;

  toggleOptions(): void {
    this.optionsVisible = !this.optionsVisible;
  }

  selectOption(option: string): void {
    this.selectedOption = option;
    console.log;
    this.optionsVisible = false;
    this.fieldErrors.civility = false; // Clear category error when category is selected
  }

  civilityOptions = [
    { label: 'Monsieur', value: 'Mr' },
    { label: 'Madame', value: 'Mrs' },
  ];

  generateSecurityCode(): string {
    // Logic to generate a security code
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  constructor(
    private router: Router,
    private userService: UserService,
    private categoryService: CategoryService
  ) {}

  ngOnInit() {
    this.fetchCategories();
  }
  categories: any[] = [];
  Souscategories: any[] = [];
  allcategories: any[] = [];

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
        for (let i = 0; i < this.categories.length; i++) {
          const parentId = this.categories[i].parent_id?.toString();
          const Id = this.categories[i].id?.toString();
          if (!parentId) {
            continue;
          }
        }
      },
      (error) => {
        console.error('Error fetching categories: ', error);
      }
    );
    console.log('categories categories', this.categories);
  }
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const targetElement = event.target as HTMLElement;
    const isCategoryOpen = !!targetElement.closest('.select-btn');
    const isStateOpen = !!targetElement.closest('.select-menu .select-btn');

    if (!isCategoryOpen && !isStateOpen) {
      this.optionsVisible = false;
    }
  }
  validateForm(): boolean {
    this.error = '';
    let isValid = true;

    // Check if required fields are empty
    if (!this.userData.first_name) {
      this.fieldErrors.first_name = true;
      isValid = false;
    } else {
      this.fieldErrors.first_name = false;
    }

    // Add similar checks for other fields...

    if (!this.userData.last_name) {
      this.fieldErrors.last_name = true;
      isValid = false;
    } else {
      this.fieldErrors.last_name = false;
    }

    if (!this.userData.email) {
      this.fieldErrors.email = true;
      isValid = false;
    } else {
      this.fieldErrors.email = false;
    }

    if (!this.userData.address) {
      this.fieldErrors.address = true;
      isValid = false;
    } else {
      this.fieldErrors.address = false;
    }

    if (!this.userData.postal_code) {
      this.fieldErrors.postal_code = true;
      isValid = false;
    } else {
      this.fieldErrors.postal_code = false;
    }

    if (!this.userData.telephone) {
      this.fieldErrors.telephone = true;
      isValid = false;
    } else {
      this.fieldErrors.telephone = false;
    }

    if (!this.userData.city) {
      this.fieldErrors.city = true;
      isValid = false;
    } else {
      this.fieldErrors.city = false;
    }

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

    if (!this.userData.termsAccepted) {
      this.fieldErrors.termsAccepted = true;
      isValid = false;
    } else {
      this.fieldErrors.termsAccepted = false;
    }

    if (!this.userData.enteredSecurityCode) {
      this.fieldErrors.security_code_incorect = false;
      this.fieldErrors.enteredSecurityCode = true;
      isValid = false;
    } else {
      this.fieldErrors.enteredSecurityCode = false;
    }
    if (!this.fieldErrors.enteredSecurityCode) {
      if (
        this.userData.enteredSecurityCode !==
        this.userData.generatedSecurityCode
      ) {
        this.fieldErrors.security_code_incorect = true;
        isValid = false;
      } else {
        this.fieldErrors.security_code_incorect = false;
      }
    }

    if (this.selectedOption) {
      if (this.selectedOption == 'Monsieur') {
        this.userData.civility = 'Mr';
      } else {
        this.userData.civility = 'Mrs';
      }

      if (!this.userData.civility) {
        this.fieldErrors.civility = true;
        isValid = false;
      } else {
        this.fieldErrors.civility = false;
      }
    }

    if (!this.userData.termsAccepted) {
      this.fieldErrors.termsAccepted = true;
      isValid = false;
    } else {
      this.fieldErrors.termsAccepted = false;
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

    if (this.showProfessionalAccount) {
      if (!this.userDataPro.activity_sector) {
        this.fieldErrors.activity_sector = true;
        isValid = false;
      } else {
        this.fieldErrors.activity_sector = false;
      }

      if (!this.userDataPro.company_address) {
        this.fieldErrors.company_address = true;
        isValid = false;
      } else {
        this.fieldErrors.company_address = false;
      }

      /*       if (!this.userDataPro.company_address_rest) {
        this.fieldErrors.company_address_rest = true;
        isValid = false;
      } else {
        this.fieldErrors.company_address_rest = false;
      }  */

      if (!this.userDataPro.company_city) {
        this.fieldErrors.city = true;
        isValid = false;
      } else {
        this.fieldErrors.city = false;
      }

      if (!this.userDataPro.company_name) {
        this.fieldErrors.company_name = true;
        isValid = false;
      } else {
        this.fieldErrors.company_name = false;
      }

      if (!this.userDataPro.company_postal_code) {
        this.fieldErrors.company_postal_code = true;
        isValid = false;
      } else {
        this.fieldErrors.company_postal_code = false;
      }

      if (!this.userDataPro.contact_email) {
        this.fieldErrors.contact_email = true;
        isValid = false;
      } else {
        this.fieldErrors.contact_email = false;
      }

      if (!this.userDataPro.contact_first_name) {
        this.fieldErrors.contact_first_name = true;
        isValid = false;
      } else {
        this.fieldErrors.contact_first_name = false;
      }

      if (!this.userDataPro.contact_last_name) {
        this.fieldErrors.contact_last_name = true;
        isValid = false;
      } else {
        this.fieldErrors.contact_last_name = false;
      }

      if (!this.userDataPro.ice) {
        this.fieldErrors.ice = true;
        isValid = false;
      } else {
        this.fieldErrors.ice = false;
      }
    }
    // Additional checks for other fields...

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
      if (this.selectedOption == 'Monsieur') {
        this.userData.civility = 'Mr';
      } else {
        this.userData.civility = 'Mrs';
      }
      // Remove unwanted fields from userData before sending it to the service
      const {
        generatedSecurityCode,
        enteredSecurityCode,
        termsAccepted,
        ...userDataToSend
      } = this.userData;
      console.log('Registration successful', userDataToSend);

      if (this.showProfessionalAccount) {
        this.userData.professional = this.userDataPro;
        this.userService.registerUser(userDataToSend).subscribe(
          () => {
            // Handle successful registration
            window.location.href = '/account-activation'; // Redirect to login page
          },
          (data) => {
            // Handle registration error
            console.error('Failed to register user', data);
          }
        );
      } else {
        const { professional, ...userDataToSend } = this.userData;
        this.userService.registerUser(userDataToSend).subscribe(
          (data) => {
            console.log('Registration data', data);

            // Handle successful registration
            window.location.href = '/account-activation';
          },
          (error) => {
            // Handle registration error
            console.error('Failed to register user', error);
            this.error = error;
          }
        );
      }
    }

    // Call your service to register the user with userDataToSend
  }

  updateSecurityCode(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement) {
      this.userData.enteredSecurityCode = inputElement.value;
    }
  }

  resetForm(): void {
    // Generate a new security code and reset the form
    this.userData.generatedSecurityCode = this.generateSecurityCode();
    // Reset other form fields as needed
    // this.userData = { ... }; // Reset other form fields if needed
  }
}
