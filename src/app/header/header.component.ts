import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  loggedInUserName: string ="Account";

  ngOnInit(): void {
    if (typeof localStorage !== 'undefined') {
      // Retrieve the logged-in user's name from localStorage
      console.log("ttttt",localStorage);
      const userDataString = localStorage.getItem('loggedInUser');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        this.loggedInUserName = `${userData.first_name} ${userData.last_name}`;
      }
    }
  }
  
}
