import { Component, OnInit } from '@angular/core';
import { PageService } from '../page.service';
import { CategoryService } from '../category.service';

@Component({
  selector: 'app-conditions-generales',
  templateUrl: './conditions-generales.component.html',
  styleUrls: ['./conditions-generales.component.css'],
})
export class ConditionsGeneralesComponent implements OnInit {
  pageContent: string = '';
  titrePage: string = '';
  categories: any[] = [];
  Souscategories: any[] = [];
  constructor(
    private pageService: PageService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.fetchCategories();
    this.loadPage('2', '1'); // Example pageId and langId
  }

  fetchCategories(): void {
    this.categoryService.getCategoriesFrom().subscribe(
      (categories) => {
        this.categories = categories.data.filter(
          (category: any) =>
            category.active === true && category.parent_id !== null
        );
      },
      (error) => {
        console.error('Error fetching categories: ', error);
      }
    );
  }

  loadPage(pageId: string, langId: string): void {
    this.pageService.getPage(pageId, langId).subscribe(
      (data) => {
        this.pageContent = this.modifyHeaders(data.data.content);
        this.titrePage = data.data.title;
      },
      (error) => {
        console.error('Error fetching page data', error);
      }
    );
  }

  private modifyHeaders(content: string): string {
    // Replace <h1> with <div class="single-header style-2"><h2>
    content = content.replace(
      /<h1>/g,
      '<div class="single-header style-2"><h1>'
    );
    content = content.replace(/<\/h1>/g, '</h1></div>');

    // Replace <h2> with <h3>
    content = content.replace(/<h2>/g, '<h3>');
    content = content.replace(/<\/h2>/g, '</h3>');

    return content;
  }
}
