import { Component, OnInit } from '@angular/core';
import { CategoryService } from '../category.service';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css',

})
export class HomePageComponent implements OnInit  {
  categories: any[] = [];
  Souscategories: any[] = [];
  constructor(private categoryService: CategoryService) { }

  ngOnInit(): void {
    this.getCategories();
    
  }

  getCategories(): void {
    this.categoryService.getCategories()
      .subscribe(categories => {
        // Filter categories based on status = ACTIVE and parent_id = null
        this.categories = categories.filter(category => category.status === 'ACTIVE' && category.parent_id === null);
        this.Souscategories =categories.filter(category => category.status === 'ACTIVE' && category.parent_id !== null)
      });
  }
  
}
