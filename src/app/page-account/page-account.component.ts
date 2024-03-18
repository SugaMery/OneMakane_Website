import { Component } from '@angular/core';
import { AuthGuard } from '../auth.guard';

@Component({
  selector: 'app-page-account',
  templateUrl: './page-account.component.html',
  styleUrl: './page-account.component.css'
})
export class PageAccountComponent {
  loggedInUserName: string ="Account";
  userData: any; 
  ngOnInit(): void {
    if (typeof localStorage !== 'undefined') {
      // Retrieve the logged-in user's name from localStorage
      console.log("ttttt",localStorage);
      const userDataString = localStorage.getItem('loggedInUser');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        this.loggedInUserName = `${userData.first_name} ${userData.last_name}`;
        this.userData = JSON.parse(userDataString);
      }
    }
  }

  constructor(private authService: AuthGuard) {}

  logout(): void {
    this.authService.logout();
  }

  selectedOption: string | null = null;
  optionsVisible: boolean = false;
  toggleOptions(): void {
    this.optionsVisible = !this.optionsVisible;
  }
}
