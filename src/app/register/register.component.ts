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
    email: '',
    address: '',
    postal_code: '',
    telephone: '',
    city: '',
    civility: '',
    password: '',
    role_id:2,
    repeat_password: '',
    professional:{},
    generatedSecurityCode: this.generateSecurityCode(),
    enteredSecurityCode: '',
    termsAccepted: false
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
    contact_last_name: ''
  }

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
    console.log
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
    if (this.userData.password !== this.userData.repeat_password) {
      console.log("Passwords don't match");
      return;
    }
    if (this.userData.enteredSecurityCode !== this.userData.generatedSecurityCode) {
      console.log("Incorrect security code");
      return;
    }

    if(
      this.selectedOption == "Monsieur"
    ){
      this.userData.civility = "Mr";
    }else{
      this.userData.civility =     "Mme";
    }
    // Remove unwanted fields from userData before sending it to the service
    const { generatedSecurityCode, enteredSecurityCode, termsAccepted, ...userDataToSend } = this.userData;
    console.log('Registration successful',userDataToSend);

     if(this.showProfessionalAccount){
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
     }else{
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
