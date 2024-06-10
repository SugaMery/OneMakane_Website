import { Component } from '@angular/core';
import { CategoryService } from '../category.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  categories: any[] = [];
  Souscategories: any[] = [];


  constructor(
    private categoryService: CategoryService,
  ) {}

  ngOnInit(): void {
    this.getCategories();
  }
  navigateToCategory(categoryId: number) {
    window.location.href = `/ads-category/${categoryId}`;
  }

  getCategories(): void {
    this.categoryService.getCategoriesFrom().subscribe((categories) => {
      // Filter root categories
      this.categories = categories.data.filter(
        (category: { active: boolean; parent_id: null }) =>
          category.active === true && category.parent_id === null
      );
      //console.log('ttttttttttttt', categories, this.categories);

      // Loop through root categories
      this.categories.forEach((category: any) => {
        // Find subcategories for each root category
        category.subcategories = categories.data.filter(
          (subcat: any) =>
            subcat.active === true && subcat.parent_id === category.id
        );

        // Loop through subcategories
        category.subcategories.forEach((subcategory: any) => {
          // Find sub-subcategories for each subcategory
          subcategory.subsubcategories = categories.data.filter(
            (subsubcat: any) =>
              subsubcat.active === true &&
              subsubcat.parent_id === subcategory.id
          );
        });
      });

      //console.log('Filter root categories', this.categories);
    });
  }

}
