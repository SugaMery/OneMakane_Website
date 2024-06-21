import { Component } from '@angular/core';
import { PageService } from '../page.service';
import { CategoryService } from '../category.service';

@Component({
  selector: 'app-mentions-legales',
  templateUrl: './mentions-legales.component.html',
  styleUrl: './mentions-legales.component.css',
})
export class MentionsLegalesComponent {
  pageContent: any;

  constructor(
    private pageService: PageService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.fetchCategories();

    this.loadPage('3', '1'); // Example pageId and langId
  }

  loadPage(pageId: string, langId: string): void {
    this.pageService.getPage(pageId, langId).subscribe(
      (data) => {
        this.pageContent = data.data.content;
      },
      (error) => {
        console.error('Error fetching page data', error);
      }
    );
  }

  categories: any[] = [];
  Souscategories: any[] = [];

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
