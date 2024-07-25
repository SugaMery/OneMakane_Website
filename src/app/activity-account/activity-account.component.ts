import { Component } from '@angular/core';
import { CategoryService } from '../category.service';
import { LanguageService } from '../language.service';

@Component({
  selector: 'app-activity-account',
  templateUrl: './activity-account.component.html',
  styleUrl: './activity-account.component.css',
})
export class ActivityAccountComponent {
  categories: any[] = [];
  Souscategories: any[] = [];

  constructor(
    private categoryService: CategoryService,
    private languageService: LanguageService
  ) {}

  currentLanguage!: string;

  setLanguage(language: string) {
    this.languageService.setLanguage(language);
    this.currentLanguage = language;
  }

  ngOnInit() {
    this.currentLanguage = this.languageService.getCurrentLanguage();

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
