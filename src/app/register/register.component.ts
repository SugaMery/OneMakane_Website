import {  Component } from '@angular/core';
import { UserService } from '../user.service';

import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  
  userData = {
    first_name: '',
    last_name: '',
    telephone: '',
    email: '',
    role_id: '',
    password: '',
    confirmPassword: '',
    civility: '',
    address: '',
    city: '',
    postal_code: '',
    generatedSecurityCode: this.generateSecurityCode(),
    enteredSecurityCode: '',
    termsAccepted: false
  };
  optionsVisible: boolean = false;
  selectedOption: string | null = null;

  toggleOptions(): void {
    this.optionsVisible = !this.optionsVisible;
  }

  selectOption(option: string): void {
    this.selectedOption = option;
    this.optionsVisible = false;
  }

  civilityOptions = [
    { label: 'Monsieur', value: 'Mr' },
    { label: 'Madame', value: 'Mme' }
  ];

  generateSecurityCode(): string {
    // Logic to generate a security code
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  constructor(
    private router: Router,
    private userService: UserService
  ) {}


  onSubmit(): void {
    // Logic to handle form submission
    if (this.userData.password !== this.userData.confirmPassword) {
      console.log("Passwords don't match");
      return;
    }
    if (this.userData.enteredSecurityCode !== this.userData.generatedSecurityCode) {
      console.log("Incorrect security code");
      return;
    }

    // Remove unwanted fields from userData before sending it to the service
    const { generatedSecurityCode, enteredSecurityCode, termsAccepted, confirmPassword, ...userDataToSend } = this.userData;

    // Call your service to register the user with userDataToSend
    this.userService.registerUser(userDataToSend).subscribe(
      () => {
        // Handle successful registration
        console.log('Registration successful');
        this.router.navigate(['/login']); // Redirect to login page
      },
      (error) => {
        // Handle registration error
        console.error('Failed to register user', error);
      }
    );
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
