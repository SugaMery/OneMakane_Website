import { Component } from '@angular/core';
import { AuthGuard } from '../auth.guard';
import { Router } from '@angular/router';
import { UserService } from '../user.service';
import { CategoryService } from '../category.service';

@Component({
  selector: 'app-page-account',
  templateUrl: './page-account.component.html',
  styleUrl: './page-account.component.css'
})
export class PageAccountComponent {
  loggedInUserName: string ="Account";

  ngOnInit(): void {
    if (typeof localStorage !== 'undefined') {
      // Retrieve the logged-in user's name from localStorage
      const userId = localStorage.getItem('loggedInUserId');
      const accessToken = localStorage.getItem('loggedInUserToken');
      if (userId && accessToken) {
        // Now fetch user information using access token
        this.userService.getUserInfoById(Number(userId), accessToken).subscribe(userInfo => {
          this.loggedInUserName = `${userInfo.data.first_name} ${userInfo.data.last_name}`;
        });
      }
    };
    this.categoryService.getCategories().subscribe(
      categories => {
        this.categories = categories.filter(category => category.status === 'ACTIVE' && category.parent_id === null);
      },
      error => {
        console.error('Error fetching categories: ', error);
      }
    );
  }

  uploadedImages: string[] = [];
  isPhone(): boolean {
    // Vous pouvez définir ici votre logique de détection du téléphone
    // Par exemple, détecter la largeur de l'écran
    const screenWidth = window.innerWidth;
    if (screenWidth <= 768) { // Par exemple, pour les écrans de largeur inférieure ou égale à 768 pixels
      return true; // Il s'agit d'un téléphone
    } else {
      return false; // Il ne s'agit pas d'un téléphone
    }
  }

  onFileSelected(event: any) {
      const file: File = event.target.files[0];
      const reader = new FileReader();

      reader.onload = (e: any) => {
          this.uploadedImages.push(e.target.result);
      };

      reader.readAsDataURL(file);
  }
  categories: { name: string }[] = [];
  constructor(private authService: AuthGuard,
    private router: Router,
    private userService: UserService,
    private categoryService: CategoryService
    ) {}

  logout(): void {
    this.authService.logout();
  }

  selectedOption: string | null = null;
  optionsVisible: boolean = false;
  toggleOptions(): void {
    this.optionsVisible = !this.optionsVisible;
  }

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


  selectOption(category: string): void {
    this.selectedOption = category;
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
