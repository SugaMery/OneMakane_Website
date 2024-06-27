import { Component, Renderer2 } from '@angular/core';
import { CategoryService } from '../category.service';
import { AnnonceService } from '../annonce.service';
import { ActivatedRoute } from '@angular/router';

interface Filter {
  type: string;
  label: string;
  options: { [key: string]: string };
  dependant?: boolean;
  conditions?: { [key: string]: any };
  selectedOption?: string;
  dropdownOpen?: boolean;
}

interface Filters {
  [key: string]: Filter;
}

interface Category {
  active: boolean;
  created_at: string;
  id: number;
  model: any;
  route: any;
  name: string;
  parent_id: number | null;
  slug: string | null;
  url: string | null;
  model_fields?: ModelFields;
  parentCategoy?: Category;
  icon_path: string;
  content?: string;
  label?: string;
  media?: { url: string };
}

interface ModelField {
  label: string;
  type: string;
  help: string;
}

interface ModelFields {
  [key: string]: ModelField;
}

@Component({
  selector: 'app-ads-grid',
  templateUrl: './ads-grid.component.html',
  styleUrl: './ads-grid.component.css',
})
export class AdsGridComponent {
  categoryId!: Number;
  filters: Filters = {};
  category: any = {};
  categoryParent: any = {};
  categories: Category[] = [];
  showMore: boolean = false;
  hiddenCategories: any[] = [];
  displayedCategories: any[] = [];
  matchingFilters: any[] = [];
  ads: any[] = [];

  constructor(
    private categoryService: CategoryService,
    private annonceService: AnnonceService,
    private route: ActivatedRoute,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id !== null) {
      this.categoryId = +id;
      this.getCategoriesFilters();
      this.getCategories();
      this.getAds();
    } else {
    }
  }

  getCategoriesFilters(): void {
    const category_id = this.categoryId?.toString();
    this.categoryService.getCategoryById(category_id!).subscribe((datas) => {
      this.filters = datas.data.filters;
      this.category = datas.data;
      this.parentCategory();
      //console.log('filters', this.filters, this.category);
    });
  }

  parentCategory(): void {
    this.categoryService
      .getCategoryById(this.category.parent_id)
      .subscribe((datas) => {
        this.categoryParent = datas.data;
        //console.log('filters', this.categoryParent);
      });
  }

  selectOption(key: string, option: string) {
    this.filters[key].selectedOption = option;
    console.log(`Selected option for ${this.filters[key].label}: ${option}`);
    this.filters[key].dropdownOpen = false; // Close the dropdown after selection
  }

  toggleDropdown(key: string) {
    this.filters[key].dropdownOpen = !this.filters[key].dropdownOpen;
  }

  getCategories(): void {
    this.categoryService.getCategoriesFrom().subscribe((category) => {
      this.categories = category.data.filter(
        (category: { active: boolean; parent_id: null }) =>
          category.active === true && category.parent_id === null
      );

      this.displayedCategories = this.categories.slice(0, 4);
      this.hiddenCategories = this.categories.slice(5);
    });
  }

  toggleShowMore(): void {
    this.showMore = !this.showMore;
  }

  getFilterKeys(): string[] {
    return Object.keys(this.filters);
  }

  getFiltersKeys(): string[] {
    return Object.keys(this.filters).filter((key) => {
      const filter = this.filters[key];
      return filter.type === 'select' && !filter.dependant;
    });
  }

  getFiltersWitoutCheck(): any[] {
    return this.matchingFilters.filter((filter) => {
      return filter.type === 'select' || filter.type === 'int';
    });
  }

  isSelected(filterKey: string, optionKey: string): boolean {
    return this.filters[filterKey].selectedOption === optionKey;
  }

  selectOptioneds(filterKey: string, optionKey: string): void {
    this.filters[filterKey].selectedOption = optionKey;
    //console.log('Selected option', this.filters, filterKey, optionKey);
    this.matchingFilters = [];
    for (const key of this.getFilterKeys()) {
      const filter = this.filters[key];
      if (filter.conditions && Array.isArray(filter.conditions)) {
        if (filter.conditions.includes(optionKey.toString())) {
          this.matchingFilters.push(filter);
        }
      }
    }
    if (this.matchingFilters.length > 0) {
      console.log(
        'Condition met in the following filters:',
        this.matchingFilters
      );
    } else {
      console.log('No matching condition for optionKey:', optionKey);
    }
  }

  getAds(): void {
    this.annonceService.getAds().subscribe((datas) => {
      let ads = datas.data.filter(
        (ad: { category_id: number }) => ad.category_id === this.categoryId
      );

      // Filter ads based on selected options in filters
      for (const key of Object.keys(this.filters)) {
        const filter = this.filters[key];
        if (filter.selectedOption) {
          ads = ads.filter((ad: any) => {
            // Assuming 'additional' is where your filterable properties are stored in ad
            return (
              ad.additional && ad.additional[key] === filter.selectedOption
            );
          });
        }
      }

      // Update the ads array with filtered results
      this.ads = ads;
    });
  }
}
