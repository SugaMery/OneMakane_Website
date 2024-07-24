import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CategoryService } from '../category.service';
import { PageService } from '../page.service';
import { isPlatformBrowser } from '@angular/common';
import { LanguageService } from '../language.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class FooterComponent implements OnInit {
  categoriesFooter: any[] = [];
  Souscategories: any[] = [];
  slugPage1: string = '';
  titrePage1: string = '';
  slugPage2: string = '';
  titrePage2: string = '';
  isScreenSmall: boolean = false;

  constructor(
    private pageService: PageService,
    private categoryService: CategoryService,
    @Inject(PLATFORM_ID) private platformId: any,
    private languageService: LanguageService
  ) {}
  currentLanguage!: string;

  setLanguage(language: string) {
    this.languageService.setLanguage(language);
    this.currentLanguage = language;
  }

  ngOnInit(): void {
    this.currentLanguage = this.languageService.getCurrentLanguage();

    this.getCategories();
    if (isPlatformBrowser(this.platformId)) {
      this.checkScreenWidth();
      // Listen to window resize event only in browser environment
      window.addEventListener('resize', () => this.checkScreenWidth());
    }
    this.pageService.getPage('2', '1').subscribe((data) => {
      this.slugPage1 = data.data.page.slug; // Assuming 'slug' is the property in your data structure
      this.titrePage1 = data.data.title;
    });
    this.pageService.getPage('3', '1').subscribe((data) => {
      this.slugPage2 = data.data.page.slug; // Assuming 'slug' is the property in your data structure
      this.titrePage2 = data.data.title;
    });
  }
  navigateToCategory(categoryId: number) {
    window.location.href = `/ads-category/${categoryId}`;
  }
  checkScreenWidth() {
    if (isPlatformBrowser(this.platformId)) {
      this.isScreenSmall = window.innerWidth < 1600 && window.innerWidth > 992;
    }
  }
  getCategories(): void {
    this.categoryService.getCategoriesFrom().subscribe((categories) => {
      // Filter root categories
      this.categoriesFooter = categories.data.filter(
        (category: { active: boolean; parent_id: null }) =>
          category.active === true && category.parent_id === null
      );
      //console.log('ttttttttttttt', categories, this.categoriesFooter);
      // Loop through root categories
      this.categoriesFooter.forEach((category: any) => {
        this.categoryService.getCategoryById(category.id).subscribe((datas) => {
          category.category_langs = datas.data.category_langs;
        });
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

      console.log('Filter root categories', this.categoriesFooter);
    });
  }
}
