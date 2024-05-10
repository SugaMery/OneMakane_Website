import { Component, HostListener } from '@angular/core';
import { UserService } from '../user.service';

import { Router } from '@angular/router';

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
    role_id: 2,
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
    { label: 'Madame', value: 'Mme' },
  ];

  generateSecurityCode(): string {
    // Logic to generate a security code
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  constructor(private router: Router, private userService: UserService) {}

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
    console.log('password', this.fieldErrors.password);
    console.log('first_name', this.fieldErrors.first_name);

    let isValid = true;

    // Vérifier si les champs requis sont vides
    if (!this.userData.first_name) {
      this.fieldErrors.first_name = true;
      isValid = false;
    } else {
      this.fieldErrors.first_name = false;
    }

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
      this.fieldErrors.enteredSecurityCode = true;
      isValid = false;
    } else {
      this.fieldErrors.enteredSecurityCode = false;
    }
    console.log('userData', this.userData.password);

    if (!this.userData.civility) {
      this.fieldErrors.civility = true;
      isValid = false;
    } else {
      this.fieldErrors.civility = false;
    }
    console.log(
      'testtt',
      this.fieldErrors.password,
      this.fieldErrors.repeat_password
    );
    if (!this.fieldErrors.password && !this.fieldErrors.repeat_password) {
      console.log(
        'test22',
        this.userData.password,
        this.userData.repeat_password
      );
      if (this.userData.password !== this.userData.repeat_password) {
        console.log(
          'test333',
          this.userData.password,
          this.userData.repeat_password
        );
        this.fieldErrors.repeat_passwords = true;
      } else {
        this.fieldErrors.repeat_passwords = false;
      }
    } else {
      this.fieldErrors.repeat_passwords = false;
    }

    if (!isValid) {
      return false;
    }
    // Si tous les champs sont remplis, permettre le passage à l'étape suivante
    return isValid;
  }

  clearError(fieldName: string): void {
    this.fieldErrors[fieldName] = false;
  }

  onSubmit(): void {
    if (this.validateForm()) {
      // Logic to handle form submission
      if (this.userData.password !== this.userData.repeat_password) {
        console.log("Passwords don't match");
        return;
      }
      if (
        this.userData.enteredSecurityCode !==
        this.userData.generatedSecurityCode
      ) {
        console.log('Incorrect security code');
        return;
      }

      if (this.selectedOption == 'Monsieur') {
        this.userData.civility = 'Mr';
      } else {
        this.userData.civility = 'Mme';
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
            window.location.href = '/login'; // Redirect to login page
          },
          (error) => {
            // Handle registration error
            console.error('Failed to register user', error);
          }
        );
      } else {
        const { professional, ...userDataToSend } = this.userData;
        this.userService.registerUser(userDataToSend).subscribe(
          () => {
            // Handle successful registration
            window.location.href = '/login'; // Redirect to login page
          },
          (error) => {
            // Handle registration error
            console.error('Failed to register user', error);
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
