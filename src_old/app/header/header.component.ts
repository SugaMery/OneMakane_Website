import { Component, OnInit } from '@angular/core';
import { CategoryService } from '../category.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  loggedInUserName: string ="Account";
  categories: any[] = [];
  Souscategories: any[] = [];
  showMore: boolean = false;
  constructor(private categoryService: CategoryService) { }

  ngOnInit(): void {
    console.log("ttttt");
    if (typeof localStorage !== 'undefined') {
      // Retrieve the logged-in user's name from localStorage
      console.log("ttttt",localStorage);
      const userDataString = localStorage.getItem('loggedInUser');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        this.loggedInUserName = `${userData.first_name} ${userData.last_name}`;
      }
    }
    this.getCategories();
  }
  i!: number ;

  getCategories(): void {
    this.categoryService.getCategories()
      .subscribe(categories => {
        this.categories = categories.filter(category => category.status === 'ACTIVE' && category.parent_id === null);
      });
  }

  toggleMoreCategories(): void {
    this.showMore = !this.showMore;
    const moreSlideOpen = document.querySelector('.more_slide_open') as HTMLElement;
    if (moreSlideOpen) {
      moreSlideOpen.style.display = this.showMore ? 'block' : 'none';
    }
  }
  
}
