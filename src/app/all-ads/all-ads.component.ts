import { Component, HostListener, OnInit, Renderer2 } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AnnonceService } from '../annonce.service';
import { forkJoin } from 'rxjs';
import { CategoryService } from '../category.service';
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

interface StringIndexed {
  [key: string]: string;
}

interface Setting {
  id: number;
  name: string;
  model: string;
  content: string;
  created_at: string;
  selectedOption?: SelectedOption;
  label?: string;
  optionsVisible?: boolean;
}

interface Filter {
  label: string;
  type: string;
  help: string;
  conditions?: any[]; // Adjust this type according to your actual conditions type
  options?: any; // Add other properties as needed
}

interface Filters {
  [key: string]: Filter;
}


interface SelectedOption {
  value: string;
  label: string;
}

interface CustomCategory {
  name: string;
  keywords: string[];
  icon_path: string;
  subcategories?: SubCategory[];
}

interface SubCategory {
  id?: number;
  name: string;
  keywords: string[];
  isChecked?: boolean;
  model?: string;
}
@Component({
  selector: 'app-all-ads',
  templateUrl: './all-ads.component.html',
  styleUrl: './all-ads.component.css',
})
export class AllAdsComponent implements OnInit {
  categoryId: number | undefined;
  filteredAds: any[] = [];
  categories: Category[] = [];
  subcategories: Category[] = [];
  selectedOption: any = null;
  selectedSubOption: any = null;
  optionsVisible = false;
  subOptionsVisible = false;
  minPrice: number = 0;
  maxPrice: number = 10000; // Set a reasonable default max price
  filteredAd: any[] = [];
  allAds: any[] = [];
  displayedAds: any[] = [];
  adsPerPage = 10;
  sortOption = 'featured';
  currentPage = 1;
  totalPages = 1;
  totalAdsCount = 0;
  searchTitle: string = '';
  filteredAdsBackup: any[] = [];
  constructor(
    private categoryService: CategoryService,
    private annonceService: AnnonceService,
    private route: ActivatedRoute,
    private renderer: Renderer2
  ) {
    // Listen to clicks on the document to close dropdowns if clicked outside
    this.renderer.listen('document', 'click', (event: Event) => {
      this.closeDropdowns(event);
    });
  }
  Souscategories: any[] = [];

  allcategories: any[] = [];
  fetchCategories(): void {

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
  searchQuery: string | undefined;
  ngOnInit(): void {
    this.fetchCategories();
    console.log('searchQuery', this.searchQuery);
    const id = this.route.snapshot.paramMap.get('id');
    if (id !== null) {
      this.categoryId = +id;
      this.getAds();
      this.getCategoriesFiltres();
    } else {
      // Gérer le cas où l'ID est null, peut-être rediriger ou afficher un message d'erreur
    }

    this.route.queryParams.subscribe((queryParams) => {
      this.searchQuery = queryParams['search'] || '';
      //console.log('this.ser', this.searchQuery);
      if (this.searchQuery) {
        //console.log('this.ser222', this.searchQuery);

        this.filterAdsByTitles();
      }
    });
  }

  filterAdsByTitles(): void {
    const searchTerm = this.searchQuery!.toLowerCase();
    console.log('ttttrrr', searchTerm, this.filteredAds);
    this.searchTitle = searchTerm;
    this.filteredAds = this.allAds.filter((conversation) => {
      console.log('testtttt', this.filteredAds);
      const title = conversation.title.toLowerCase();
      return title.includes(searchTerm);
    });
    this.totalAdsCount = this.filteredAds.length;

    this.applyFilters();
  }

  applyFilters(): void {
    this.sortAds();
    this.paginateAds();
    this.getCategories();
  }
  getAds(): void {
    this.annonceService.getAds('pending').subscribe((ads) => {
      if (ads && ads.data) {
        const adsByCategory = ads.data.filter(
          (ad: { category: { id: number | undefined } }) =>
            ad.category.id === this.categoryId
        );
        this.totalAdsCount = adsByCategory.length;
        this.filteredAds = [];

        adsByCategory.forEach((ad: { id: string }) => {
          this.annonceService.getAdById(ad.id).subscribe((data) => {
            this.filteredAds.push(data.data);
            this.allAds.push(data.data);
            this.applyFilters();
          });
          this.totalAdsCount = this.filteredAds.length;
        });
      }
    });
  }

  getCategories(): void {
    this.categoryService.getCategoriesFrom().subscribe((category) => {
      this.categories = category.data.filter(
        (category: { active: boolean; parent_id: null }) =>
          category.active === true && category.parent_id === null
      );
    });
  }

  selectOption(category: Category): void {
    this.selectedOption = category;
    this.subcategories = []; // Reset subcategories
    this.selectedSubOption = null; // Reset selected subcategory
    this.getSubcategories(category.id);
    this.optionsVisible = false;
    this.fetchAds();
  }

  getSubcategories(parentId: number): void {
    this.categoryService.getCategoriesFrom().subscribe((subcategory) => {
      this.subcategories = subcategory.data.filter(
        (subcategory: { active: boolean; parent_id: number }) =>
          subcategory.active === true && subcategory.parent_id === parentId
      );
    });
  }

  selectSubOption(subcategory: any): void {
    this.selectedSubOption = subcategory;
    this.subOptionsVisible = false;
    this.fetchAds();
  }

  toggleDropdown(event: MouseEvent): void {
    event.stopPropagation();
    const element = event.currentTarget as HTMLElement;
    const dropdown = element.querySelector('.dropdown-menu') as HTMLElement;
    if (dropdown) {
      dropdown.classList.toggle('show');
    }
  }

  fetchAds(): void {
    const selectedCategoryId =
      this.selectedSubOption?.id || this.selectedOption?.id;
    if (!selectedCategoryId) {
      return;
    }

    // Get subcategories based on selected category (if no subcategory is selected)
    if (!this.selectedSubOption && this.selectedOption) {
      this.categoryService.getCategoriesFrom().subscribe((response) => {
        const subcategories = response.data.filter(
          (subcategory: any) =>
            subcategory.active === true &&
            subcategory.parent_id === this.selectedOption!.id
        );

        // Collect all category IDs (selected category + subcategories)
        const categoryIds = subcategories.map(
          (subcategory: { id: any }) => subcategory.id
        );
        categoryIds.push(this.selectedOption!.id);

        // Fetch and filter ads based on collected category IDs
        this.filterAds(categoryIds);
      });
    } else {
      // Fetch and filter ads based on selected subcategory ID
      this.filterAds([selectedCategoryId]);
    }
  }
  filters: Filters = {};
    getCategoriesFiltres(): void {
    const category_id = this.categoryId?.toString();
    this.categoryService.getCategoryById(category_id!).subscribe((datas) => {
      this.filters = datas.data.filters ;
      console.log("filitzr",this.filters);
    });
  }
  getFilterKeys(): string[] {
    return Object.keys(this.filters);
  }

  applyCondition(filter: Filter, condition: any): void {
    console.log('Applying condition:', condition, 'to filter:', filter);
    // Add your logic here to handle the condition application
  }
  toggleOptioned(event: MouseEvent): void {
    event.stopPropagation();
    this.optionsVisibled = !this.optionsVisibled;
  }

  selectedFilter: Filter | null = null;
  optionsVisibled = false;

  selectFilter(key: string): void {
    this.selectedFilter = this.filters[key];
    this.optionsVisibled = false; // Close dropdown after selection if needed
    // You can add logic here to apply the selected filter
    console.log('Selected filter:', this.selectedFilter);
  }
  isConditionType(filter: Filter): boolean {
    return filter.type === 'condition';
  }

  filterAds(categoryIds: number[]): void {
    this.annonceService.getAds('pending').subscribe((ads) => {
      if (ads && ads.data) {
        const adsByCategory = ads.data.filter((ad: any) =>
          categoryIds.includes(ad.category.id)
        );
        this.totalAdsCount = adsByCategory.length;
        this.allAds = adsByCategory;
        this.filteredAds = adsByCategory;
        this.applyFilters();
      }
    });
  }
  filterPrice(): void {
    console.log('filteredAds', this.filteredAds);
    this.filteredAds = this.allAds.filter(
      (ad) => ad.price >= this.minPrice && ad.price <= this.maxPrice
    );
    this.applyFilters(); // Fetch and filter ads by price
  }
  filterAdsByPrice(): void {
    if (this.minPrice > this.maxPrice) {
      return; // Do not apply filter if min price is greater than max price
    } else {
      this.filterPrice();
      this.totalAdsCount = this.filteredAds.length;
    }
    if (this.minPrice == null || this.maxPrice == null) {
      this.filteredAds = this.allAds.filter(
        (ad) => ad.price >= this.minPrice || ad.price <= this.maxPrice
      );
      this.totalAdsCount = this.filteredAds.length;
      this.applyFilters();
    }

    if (this.minPrice == null && this.maxPrice == null) {
      this.filteredAds = this.allAds;
      this.applyFilters();
      this.totalAdsCount = this.filteredAds.length;
    }
    console.log('miiin', this.maxPrice, this.minPrice);
  }

  filterAdsByTitle(event: any): void {
    const searchTerm = event.target.value.toLowerCase();
    this.filteredAds = this.allAds.filter((conversation) => {
      console.log('testtttt', this.filteredAds);
      const title = conversation.title.toLowerCase();
      return title.includes(searchTerm);
    });
    this.applyFilters();
  }

  getCategoryAndSubcategoryIds(): number[] {
    const categoryIds = this.subcategories.map((subcategory) => subcategory.id);
    if (this.selectedOption) {
      categoryIds.push(this.selectedOption.id);
    }
    return categoryIds;
  }
  filterByCategory(categoryId: number): void {
    this.filteredAds = []; // Clear previous filtered ads
    this.annonceService.getAds('pending').subscribe((ads) => {
      if (ads && ads.data) {
        ads.data.forEach((ad: { category: { id: number }; id: string }) => {
          if (ad.category.id === categoryId) {
            this.annonceService.getAdById(ad.id).subscribe((data) => {
              this.filteredAds.push(data.data);
            });
          }
        });
      }
    });
    // Optionally, call applyFilters if you have additional filters
    this.applyFilters();
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
  sortAds(): void {
    switch (this.sortOption) {
      case 'priceLowToHigh':
        this.filteredAds.sort(
          (a, b) => parseFloat(a.price) - parseFloat(b.price)
        );
        break;
      case 'priceHighToLow':
        this.filteredAds.sort(
          (a, b) => parseFloat(b.price) - parseFloat(a.price)
        );
        break;
      case 'releaseDate':
        this.filteredAds.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      case 'avgRating':
        this.filteredAds.sort((a, b) => b.rating - a.rating);
        break;
      default:
        // Sort by featured or any default sorting logic
        break;
    }
    this.paginateAds();
  }

  paginateAds(): void {
    this.totalPages = Math.ceil(this.filteredAds.length / this.adsPerPage);
    const startIndex = (this.currentPage - 1) * this.adsPerPage;
    const endIndex = startIndex + this.adsPerPage;
    this.displayedAds = this.filteredAds.slice(startIndex, endIndex);
  }

  changeAdsPerPage(count: number): void {
    this.adsPerPage = count;
    this.currentPage = 1; // Reset to first page
    this.paginateAds();
  }

  changeSortOption(option: string): void {
    this.sortOption = option;
    this.applyFilters();
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.currentPage = page;
    this.paginateAds();
  }

  getPagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (v, k) => k + 1);
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

  toggleOptions(event: Event): void {
    event.stopPropagation();
    this.optionsVisible = !this.optionsVisible;
    if (this.optionsVisible) {
      this.subOptionsVisible = false; // Close the other dropdown
    }
  }

  toggleSubOptions(event: Event): void {
    event.stopPropagation();
    this.subOptionsVisible = !this.subOptionsVisible;
    if (this.subOptionsVisible) {
      this.optionsVisible = false; // Close the other dropdown
    }
  }

  closeDropdowns(event: Event): void {
    const clickedInsideOptionMenu =
      (event.target as HTMLElement).closest('.select-menu') ||
      (event.target as HTMLElement).closest('.select-btn');
    if (!clickedInsideOptionMenu) {
      this.optionsVisible = false;
      this.subOptionsVisible = false;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    this.closeDropdowns(event);
  }

  stopEventPropagation(event: Event): void {
    event.stopPropagation();
  }
}
