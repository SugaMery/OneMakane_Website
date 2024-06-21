import { Component } from '@angular/core';
import { CategoryService } from '../category.service';

@Component({
  selector: 'app-message-add-annonce',
  templateUrl: './message-add-annonce.component.html',
  styleUrl: './message-add-annonce.component.css',
})
export class MessageAddAnnonceComponent {
  categories: any[] = [];
  Souscategories: any[] = [];

  constructor(private categoryService: CategoryService) {}
  ngOnInit() {
    this.fetchCategories();
  }

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
}
