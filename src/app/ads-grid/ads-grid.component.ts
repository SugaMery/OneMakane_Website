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
  hiddenCategoriesParent: any[] = [];
  displayedCategories: any[] = [];
  displayedCategoriesParent: any[] = [];
  matchingFilters: any[] = [];
  ads: any[] = [];
  currentPage = 1;
  totalPages = 1;
  filteredAds: any[] = [];
  adsPerPage = 10;
  sortOption = 'featured';
  searchTitle: string = '';
  originalAds: any[] = [];

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
      this.getAdsList();
    } else {
    }
  }

  getAdsList(): void {
    this.annonceService.getAds().subscribe((datas) => {
      let ads = datas.data.filter(
        (ad: { category_id: number }) => ad.category_id === this.categoryId
      );
      let adsProcessed = 0;

      this.originalAds = []; // Clear the originalAds array before populating

      ads.forEach((element: { id: string }) => {
        this.annonceService.getAdById(element.id).subscribe((data) => {
          adsProcessed++;
          const detailedAd = data.data;

          this.ads.push(detailedAd);
          this.originalAds.push(detailedAd); // Add to originalAds as well
        });
      });
    });
  }

  vissibleCategory: boolean = false;
  allCategoriesSameParent: Category[] = [];
  getCategoriesFilters(): void {
    const category_id = this.categoryId?.toString();
    this.categoryService.getCategoryById(category_id!).subscribe((datas) => {
      console.log('greeeet in ', datas);
      this.filters = datas.data.filters;
      this.category = datas.data;

      this.parentCategory();
      console.log('greeeet in ', datas);
      if (datas.data.parent_id == null) {
        this.vissibleCategory = true;
        console.log('filters', datas.data.id);
        this.getCategoriesByParentId(datas.data.id);
        console.log('rrrrrrrrrr', this.allCategoriesSameParent);
      } else {
        this.vissibleCategory = false;
      }
    });
  }

  filterAdsByTitle(event: any): void {
    const searchTerm = event.target.value.toLowerCase();

    // Reset ads to the original list before filtering
    this.ads = [...this.originalAds];

    // Apply the search filter
    this.ads = this.ads.filter((conversation) => {
      const title = conversation.title.toLowerCase();
      return title.includes(searchTerm);
    });

    this.applyFilters();
  }

  getCategoriesByParentId(parentId: number): void {
    this.categoryService.getCategoriesFrom().subscribe((datas) => {
      this.allCategoriesSameParent = datas.data.filter(
        (category: { parent_id: number }) => category.parent_id === parentId
      );
      this.displayedCategoriesParent = this.allCategoriesSameParent.slice(0, 4);
      this.hiddenCategoriesParent = this.allCategoriesSameParent.slice(5);
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
    this.ads = [];
    console.log('grrrrrrrrrrrrrrrrr', this.ads);
    this.getAds();
    console.log('grrrrrrrrrrrrrrrrreet', this.ads);

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
    console.log('Fetching ads...');
    this.annonceService.getAds().subscribe((datas) => {
      let ads = datas.data.filter(
        (ad: { category_id: number }) => ad.category_id === this.categoryId
      );

      console.log('Filtered ads by category:', ads);

      // Using a counter to check when all asynchronous calls are completed
      let adsProcessed = 0;

      ads.forEach((element: { id: string }) => {
        this.annonceService.getAdById(element.id).subscribe((data) => {
          adsProcessed++;
          const detailedAd = data.data;

          console.log(`Detailed ad fetched (id: ${element.id}):`, detailedAd);

          // Apply filter logic to the detailed ad
          let shouldIncludeAd = true;
          for (const key of Object.keys(this.filters)) {
            const filter = this.filters[key];
            if (filter.selectedOption) {
              console.log(
                `Checking filter ${key} with selected option ${filter.selectedOption}`
              );
              if (
                !detailedAd.additional ||
                detailedAd.additional[key] !== filter.selectedOption
              ) {
                console.log(
                  `Ad (id: ${element.id}) does not match filter ${key} with selected option ${filter.selectedOption}`
                );
                shouldIncludeAd = false;
                break;
              }
            }
          }

          // If the ad matches all selected filter options, keep it in the ads array
          if (shouldIncludeAd) {
            this.ads.push(detailedAd);
            console.log(
              `Ad (id: ${element.id}) matches all filters and is included.`
            );
          }

          // After processing all ads, log the results
          if (adsProcessed === ads.length) {
            console.log('All ads processed. Final ads list:', this.ads);
          }
        });
      });

      // Clear ads array to start fresh for each getAds call
      this.ads = [];
    });
  }

  getRelativeTime(createdAt: string): string {
    const currentDate = new Date();
    const adDate = new Date(createdAt);
    const timeDiff = currentDate.getTime() - adDate.getTime();
    const seconds = Math.floor(timeDiff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 1) {
      return days + ' jours passés';
    } else if (days === 1) {
      return (
        'hier à ' +
        adDate.toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    } else {
      return (
        "aujourd'hui à " +
        adDate.toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    }
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.currentPage = page;
    this.paginateAds();
  }

  paginateAds(): void {
    this.totalPages = Math.ceil(this.ads.length / this.adsPerPage);
    const startIndex = (this.currentPage - 1) * this.adsPerPage;
    const endIndex = startIndex + this.adsPerPage;
    this.ads = this.ads.slice(startIndex, endIndex);
  }

  getPagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (v, k) => k + 1);
  }

  changeSortOption(option: string): void {
    this.sortOption = option;
    this.applyFilters();
  }

  applyFilters(): void {
    this.sortAds();
    this.paginateAds();
    this.getCategories();
  }

  sortAds(): void {
    switch (this.sortOption) {
      case 'priceLowToHigh':
        this.ads.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case 'priceHighToLow':
        this.ads.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case 'releaseDate':
        this.ads.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      case 'avgRating':
        this.ads.sort((a, b) => b.rating - a.rating);
        break;
      default:
        // Sort by featured or any default sorting logic
        break;
    }
    this.paginateAds();
  }

  sortOptionsTranslation: { [key: string]: string } = {
    featured: 'Mis en avant',
    priceLowToHigh: 'Prix : croissant',
    priceHighToLow: 'Prix : décroissant',
    releaseDate: 'Date de sortie',
    avgRating: 'Note moyenne',
  };
  getSortOptionLabel(option: string): string {
    return this.sortOptionsTranslation[option] || option;
  }

  changeAdsPerPage(count: number): void {
    this.adsPerPage = count;
    this.currentPage = 1; // Reset to first page
    this.paginateAds();
  }
}
