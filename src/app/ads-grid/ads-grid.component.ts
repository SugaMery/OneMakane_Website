import {
  Component,
  ElementRef,
  HostListener,
  Inject,
  PLATFORM_ID,
  Renderer2,
} from '@angular/core';
import { CategoryService } from '../category.service';
import { AnnonceService } from '../annonce.service';
import { ActivatedRoute } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

interface Option {
  key: string; // Unique identifier for the option
  value: string; // Display value of the option
  checked?: boolean; // State of the checkbox
}

interface Filter {
  type: string;
  label: string;
  options: { [key: string]: Option };
  dependant?: boolean;
  conditions?: { [key: string]: any };
  selectedOption?: string;
  dropdownOpen?: boolean;
  key?: string;
  selectedOptions: { [key: string]: Option };
  route?: string;
  selectedLabel: string;
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
  matchingFilters: Filter[] = [];
  matchingFiltered: Filter[] = [];

  ads: any[] = [];
  currentPage = 1;
  totalPages = 1;
  filteredAds: any[] = [];
  adsPerPage = 10;
  sortOption = 'featured';
  searchTitle: string = '';
  originalAds: any[] = [];
  vissibleCategory: boolean = false;
  allCategoriesSameParent: Category[] = [];
  isScreenSmall!: boolean;
  isScreenphone: boolean = false;
  dropdownOpen: string | null = null; // Define dropdownOpen property
  constructor(
    private categoryService: CategoryService,
    private annonceService: AnnonceService,
    private route: ActivatedRoute,
    private renderer: Renderer2,
    @Inject(PLATFORM_ID) private platformId: any,
    private el: ElementRef
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.checkScreenWidth();
      // Listen to window resize event only in browser environment
      window.addEventListener('resize', () => this.checkScreenWidth());
    }
  }
  checkScreenWidth() {
    if (isPlatformBrowser(this.platformId)) {
      this.isScreenSmall = window.innerWidth < 1600 && window.innerWidth > 992;
      this.isScreenphone = window.innerWidth < 500;
    }
  }

  toggleDropdowns(event: Event, dropdown: string) {
    event.stopPropagation(); // Prevent event from bubbling up
    if (this.dropdownOpen === dropdown) {
      this.dropdownOpen = null;
    } else {
      this.dropdownOpen = dropdown;
      this.positionDropdowns(event.target as HTMLElement, dropdown);
    }
  }

  positionDropdowns(target: HTMLElement, dropdown: string) {
    const rect = target.getBoundingClientRect();
    const dropdownEl = document.querySelector(
      `.dropdown-container[ng-reflect-ng-if="${dropdown}"]`
    );
    if (dropdownEl) {
      dropdownEl.setAttribute(
        'style',
        `top: ${rect.bottom}px; left: ${rect.left}px;`
      );
    }
  }

  @HostListener('document:click', ['$event'])
  closeDropdown(event: Event) {
    this.dropdownOpen = null;
  }
  // Method to close dropdown on outside click
  @HostListener('document:click', ['$event'])
  onClick(event: Event) {
    // Check if the click event was outside the dropdown
    const clickedInside = this.isDescendantOf(
      event.target as Node,
      document.querySelector('.sort-by-dropdown')
    );
    if (!clickedInside) {
      // Close all dropdowns
      Object.keys(this.filters).forEach((key) => {
        this.filters[key].dropdownOpen = false;
      });
    }
  }

  // Helper function to check if an element is a descendant of a given parent
  private isDescendantOf(child: Node, parent: Node | null): boolean {
    if (!parent) return false;
    let node = child.parentNode;
    while (node != null) {
      if (node == parent) {
        return true;
      }
      node = node.parentNode;
    }
    return false;
  }

  dropdownOpene: { [key: string]: boolean } = {};

  // Function to toggle dropdown open/close
  toggleDropdowne(key: string) {
    this.dropdownOpene[key] = !this.dropdownOpene[key];
  }

  // Function to select an option and close the dropdown
  selectOptionAndClose(key: string, optionKey: string) {
    this.selectOption(key, optionKey); // Implement this function as per your requirement

    // Close the dropdown after selecting an option
    this.dropdownOpene[key] = false;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id !== null) {
      this.categoryId = +id;
      this.getCategoriesFilters();
      this.getCategories();
      this.getAdsList();
      this.categories.forEach((category) => {
        if (category.id == this.category) {
          // console.log('rrrrr', category);
        }
      });

      // console.log('eee', this.categories);
    } else {
    }
    // Fetch all query parameters as an object
    if (isPlatformBrowser(this.platformId)) {
      this.checkScreenWidth();
      // Listen to window resize event only in browser environment
      window.addEventListener('resize', () => this.checkScreenWidth());
    }
    this.mobileHeaderActive();
  }
  isFilterDrawerOpen = false;
  isDropdownOpen = false;

  toggleFilterDrawer() {
    this.isFilterDrawerOpen = !this.isFilterDrawerOpen;
  }

  toggleDropdownt() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  changeAdsPerPaget(count: number) {
    this.adsPerPage = count;
    // Close the dropdown when an option is selected
    this.isDropdownOpen = false;
  }

  // Existing methods...

  closeFilterDrawer() {
    this.isFilterDrawerOpen = false;
  }
  getAdsList(): void {
    //console.log('adsff', this.allCategoriesSameParent);

    if (this.allCategoriesSameParent.length == 0) {
      this.annonceService.getAds().subscribe((datas) => {
        let ads = datas.data.filter(
          (ad: { category_id: number }) => ad.category_id === this.categoryId
        );
        let adsProcessed = 0;

        this.originalAds = [];

        ads.forEach((element: { id: string }) => {
          this.annonceService.getAdById(element.id).subscribe((data) => {
            adsProcessed++;
            const detailedAd = data.data;

            this.ads.push(detailedAd);
            this.originalAds.push(detailedAd);
          });
        });
      });
    } else {
      for (let i = 0; i < this.allCategoriesSameParent.length; i++) {
        this.annonceService.getAds().subscribe((datas) => {
          let ads = datas.data.filter(
            (ad: { category_id: number }) =>
              ad.category_id === this.allCategoriesSameParent[i].id
          );
          let adsProcessed = 0;

          this.originalAds = [];

          ads.forEach((element: { id: string }) => {
            this.annonceService.getAdById(element.id).subscribe((data) => {
              adsProcessed++;
              const detailedAd = data.data;

              this.ads.push(detailedAd);
              this.originalAds.push(detailedAd);
              // console.log('adssss', this.ads, this.originalAds);
              if (this.searchTitle) {
                this.filterAdsByTitle(this.searchTitle);
              }
            });
          });
        });
      }
    }
  }

  getCategoriesFilters(): void {
    const category_id = this.categoryId?.toString();
    this.categoryService.getCategoryById(category_id!).subscribe((datas) => {
      // console.log('greeeet in ', datas);
      this.filters = datas.data.filters;
      this.category = datas.data;
      const queryParams = this.route.snapshot.queryParams;

      // Log all query parameters
      // console.log('All Query Parameters:', queryParams);

      // Iterate through each query parameter
      for (const key in queryParams) {
        if (queryParams.hasOwnProperty(key)) {
          const value = queryParams[key];
          // console.log(`Query Parameter ${key}: ${value}`);
          if (key !== 'search') {
            this.selectOptioneds(key, value);
          } else {
            this.searchTitle = value;

            // console.log('goooofrrrr', this.ads);
            this.getAdsList();
            //console.log('goooofrrrr', this.ads);
          }
          // Use 'key' and 'value' as needed
        }
      }
      this.parentCategory();
      // console.log('greeeet in ', datas);
      if (datas.data.parent_id == null) {
        this.vissibleCategory = true;
        //console.log('filters', datas.data.id);
        this.getCategoriesByParentId(datas.data.id);
        // console.log('rrrrrrrrrr', this.allCategoriesSameParent);
      } else {
        this.vissibleCategory = false;
      }
    });
  }

  filterAdsByTitle(event: any): void {
    const searchTerm = event.toLowerCase();

    if (searchTerm === '') {
      this.getAds();
    } else {
      this.ads = [...this.originalAds];
      this.ads = this.ads.filter((conversation) => {
        const title = conversation.title.toLowerCase();
        return title.includes(searchTerm);
      });

      this.applyFilters();
    }
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
      });
  }

  resetFilters(): void {
    Object.keys(this.filters).forEach((key) => {
      delete this.filters[key].selectedOption;
      this.filters[key].selectedLabel = ''; // Assign an empty string instead of undefined
    });
    this.matchingFilters = [];
    console.log('Filters after reset:', this.filters);
    this.applyFilter(); // Assuming this method applies the filters
  }

  applyFilter(): void {
    // Filter keys where selectedOption is defined and construct params object
    const params: { [key: string]: any } = {};

    Object.keys(this.filters).forEach((key) => {
      const filter = this.filters[key];
      if (filter.selectedOption) {
        if (
          filter.type === 'multiple' &&
          Array.isArray(filter.selectedOption)
        ) {
          // Join the selected options into a comma-separated string
          const joinedOptions = filter.selectedOption.join(',');
          if (joinedOptions) {
            params[key] = joinedOptions;
          }
        } else if (filter.selectedOption !== '') {
          // Handle other types of filters
          params[key] = filter.selectedOption;
        }
      }
    });

    // Log the params object to console
    console.log('Params:', params);

    // Example categoryId, replace with actual categoryId as needed
    const categoryId = Number(this.categoryId); // Replace with actual category ID
    this.ads = [];

    // Call getAdsByCategory with categoryId and params
    this.categoryService.getAdsByCategory(categoryId, params).subscribe(
      (response) => {
        // Handle the response here
        console.log('Ads:', response);
        this.ads = response.data;
      },
      (error) => {
        // Handle the error here
        console.error('Error fetching ads:', error);
      }
    );
  }

  selectOption(key: string, option: string) {
    delete this.filters[key].selectedOption;
    this.filters[key].selectedLabel = 'Tous';
    this.getAds();
    this.matchingFilters = [];
    const element = document.querySelector(`.sort-by-cover[data-key="${key}"]`);
    if (element) {
      element.classList.remove('show');
    }

    const element1 = document.querySelector(
      `.sort-by-dropdown[data-key="${key}"]`
    );
    if (element1) {
      element1.classList.remove('show');
    }
    //console.log(`Selected option for ${this.filters[key].label}: ${option}`,key,option);
    this.filters[key].dropdownOpen = false;
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
  getNestedKeys(options: any): string[] {
    return Object.keys(options);
  }

  getNestedOptions(options: any): { key: string; value: string }[] {
    return Object.keys(options).map((key) => ({ key, value: options[key] }));
  }

  getFiltersKeys(): string[] {
    return Object.keys(this.filters).filter((key) => {
      const filter = this.filters[key];
      if (filter.route) {
        //console.log('this filter', filter.options);
      }
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

  openmatchingFilters: boolean = false;

  selectOptioneds(filterKey: string, optionKey: string): void {
    // Update selected option for the filter
    this.filters[filterKey].selectedOption = optionKey;

    // Reset matchingFilters array
    this.matchingFilters = [];

    // Populate matchingFilters based on conditions
    for (const key of this.getFilterKeys()) {
      const filter = this.filters[key];
      if (filter.conditions && Array.isArray(filter.conditions)) {
        if (filter.conditions.includes(optionKey.toString())) {
          filter.key = key;
          this.matchingFilters.push(filter);
        }
      }
    }

    // Clear previously selected options in matchingFilters
    this.matchingFilters.forEach((filter) => {
      delete filter.selectedOption; // or set to appropriate default value
    });

    // Refresh ads and apply other necessary updates
    //this.ads = [];
    //this.getAds();

    // Remove 'show' class from the dropdown
    const element = document.querySelector(
      `.sort-by-cover[data-key="${filterKey}"]`
    );
    if (element) {
      element.classList.remove('show');
    }

    const element1 = document.querySelector(
      `.sort-by-dropdown[data-key="${filterKey}"]`
    );
    if (element1) {
      element1.classList.remove('show');
    }
    // Check if there are any matching filters
    if (this.matchingFilters.length > 0) {
      // Determine visibility based on filter type
      this.openmatchingFilters = this.matchingFilters.some(
        (filter) => filter.type === 'bool' || filter.type === 'multiple'
      );
    } else {
      console.log('No matching filters for optionKey:', optionKey);
      this.openmatchingFilters = false;
    }
  }
  ngAfterViewInit(): void {
    this.mobileHeaderActive();
  }

  mobileHeaderActive(): void {
    console.log('rrrrrrtttttt');
    const navbarTrigger2 = this.el.nativeElement.querySelector(
      '.filter-drawer-button'
    );
    const endTrigger2 = this.el.nativeElement.querySelector(
      '.new-mobile-menu-close'
    );
    const container2 = this.el.nativeElement.querySelector(
      '.new-mobile-header-active'
    );
    const wrapper2 = document.querySelector('body');

    if (!navbarTrigger2 || !endTrigger2 || !container2 || !wrapper2) {
      console.error(
        'One or more elements not found for mobile header functionality.'
      );
      return;
    }

    this.renderer.appendChild(wrapper2, this.createOverlay());

    this.renderer.listen(navbarTrigger2, 'click', (e: Event) => {
      e.preventDefault();
      this.renderer.addClass(container2, 'sidebar-visible');
      this.renderer.addClass(wrapper2, 'mobile-menu-active-2');
    });

    this.renderer.listen(endTrigger2, 'click', () => {
      this.renderer.removeClass(container2, 'sidebar-visible');
      this.renderer.removeClass(wrapper2, 'mobile-menu-active-2');
    });

    const bodyOverlay2 = wrapper2.querySelector('.body-overlay-2');
    if (bodyOverlay2) {
      this.renderer.listen(bodyOverlay2, 'click', () => {
        this.renderer.removeClass(container2, 'sidebar-visible');
        this.renderer.removeClass(wrapper2, 'mobile-menu-active-2');
      });
    }
  }

  private createOverlay(): HTMLElement {
    const overlay = this.renderer.createElement('div');
    this.renderer.addClass(overlay, 'body-overlay-2');
    return overlay;
  }

  selectOptioned(filterKey: string, optionKey: string, option: any): void {
    this.filters[filterKey].selectedOption = optionKey;
    this.filters[filterKey].selectedLabel = option.value;
    console.log('eeeeeeeehh', option);
    this.matchingFilters = [];
    this.matchingFiltered = [];
    for (const key of this.getFilterKeys()) {
      const filter = this.filters[key];
      if (filter.conditions && Array.isArray(filter.conditions)) {
        if (filter.conditions.includes(optionKey.toString())) {
          filter.key = key;
          this.matchingFilters.push(filter);
        }
      }
    }

    // Clear previously selected options in matchingFilters
    this.matchingFilters.forEach((filter) => {
      delete filter.selectedOption; // or set to appropriate default value
    });

    // this.ads = [];
    //this.getAds();
    // Remove 'show' class from the dropdown
    const element = document.querySelector(
      `.sort-by-cover[data-key="${filterKey}"]`
    );
    if (element) {
      element.classList.remove('show');
    }

    const element1 = document.querySelector(
      `.sort-by-dropdown[data-key="${filterKey}"]`
    );
    if (element1) {
      element1.classList.remove('show');
    }
    console.log('listttt', this.matchingFilters, this.filters);

    if (this.matchingFilters.length > 0) {
      this.matchingFilters.filter((filter) => {
        if (filter.type == 'bool' || filter.type == 'multiple') {
          this.matchingFiltered.push(filter);
          this.openmatchingFilters = true;
          // console.log("tteee",filter.options);
        } else {
          this.openmatchingFilters = false;
        }
      });
      //  console.log('Condition met in the following filters:', this.matchingFilters);
    } else {
      console.log('No matching condition for optionKey:', optionKey);
    }
  }
  // Inside your AdsGridComponent class
  selectedOptions: string[] = []; // Initialize with selected options if needed

  getOptionKeys(options: any): string[] {
    return Object.keys(options);
  }

  isSelecteds(key: string): boolean {
    return this.selectedOptions.includes(key);
  }

  toggleOption(key: string, filter: any): void {
    console.log('rrerereerer', key);

    if (this.isSelecteds(key)) {
      this.selectedOptions = this.selectedOptions.filter(
        (option) => option !== key
      );
    } else {
      this.selectedOptions.push(key);
    }
    console.log('rrerereerer', filter);

    filter.selectedOption = this.selectedOptions;
    filter.selectedOptions = this.selectedOptions;
    this.getAdsSous();
    // Log the current state of the checkbox to the console
    // console.log(`Checkbox ${key} checked:`, this.isSelecteds(key),filter,this.ads,this.filters);

    // Optionally, perform any other logic related to selectedOptions
  }

  // Handle input changes for 'int' type filters
  filterOption(event: any, filter: any): void {
    const optionKey = event.target.value;

    const filterKey = filter.key;
    // console.log("rrrrtttyy",optionKey,optionKey == undefined);
    if (!optionKey || optionKey == null || optionKey == undefined) {
      // Delete selectedOption when event is null
      delete this.filters[filterKey].selectedOption;
      //this.getAds();
    } else {
      //console.log('tttuuuuuuu',this.filters,filterKey,optionKey);
      this.filters[filterKey].selectedOption = optionKey;
      //this.getAdsSous();
    }
  }

  filterCheck(event: any, filter: any) {
    // Assuming filter.selectedOption is a boolean property
    const filterKey = filter.key;

    if (event.target.checked) {
      filter.selectedOption = 1;
      this.filters[filterKey].selectedOption = '1';
      this.getAdsSous();
    } else {
      filter.selectedOption = 0;
      delete this.filters[filterKey].selectedOption;
      this.getAds();
    }
    //console.log("rrrrtttyy",filter.selectedOption,event.target);
  }

  getAdsSous(): void {
    console.log('Fetching ads...');
    this.annonceService.getAds().subscribe((datas) => {
      let ads = datas.data.filter(
        (ad: { category_id: number }) => ad.category_id === this.categoryId
      );
      let adsProcessed = 0;

      ads.forEach((element: { id: string }) => {
        this.annonceService.getAdById(element.id).subscribe((data) => {
          adsProcessed++;
          const detailedAd = data.data;
          let shouldIncludeAd = true;
          for (const key of Object.keys(this.filters)) {
            const filter = this.filters[key];
            if (filter.selectedOption && detailedAd.additional && filter.key) {
              //console.log('tt',filter.selectedOption,detailedAd.additional[key]);
              if (filter.type == 'int') {
                if (filter.selectedOption <= detailedAd.additional[key]) {
                  //console.log('ffff',filter,key,detailedAd.additional[key])
                  this.ads.push(detailedAd);
                }
              } else if (filter.selectedOption == detailedAd.additional[key]) {
                // console.log('ffff',filter,key,detailedAd)
                this.ads.push(detailedAd);
              } else if (filter.type == 'multiple') {
                for (let i = 0; i < filter.selectedOption.length; i++) {
                  if (
                    detailedAd.additional[key] &&
                    detailedAd.additional[key].includes(
                      filter.selectedOption[i].toString()
                    )
                  ) {
                    // console.log("greattt", filter.selectedOption[i]);
                    if (!this.ads.some((ad) => ad === detailedAd)) {
                      this.ads.push(detailedAd);
                    }
                  }
                }

                // console.log('holaaaaaaaaaa',detailedAd.additional[key],filter.selectedOption)
              }
            }
          }
        });
      });
      this.ads = [];
    });
  }

  getAds(): void {
    console.log('Fetching ads...');

    if (this.allCategoriesSameParent.length == 0) {
      this.annonceService.getAds().subscribe((datas) => {
        let ads = datas.data.filter(
          (ad: { category_id: number }) => ad.category_id === this.categoryId
        );
        let adsProcessed = 0;

        ads.forEach((element: { id: string }) => {
          this.annonceService.getAdById(element.id).subscribe((data) => {
            adsProcessed++;
            const detailedAd = data.data;
            let shouldIncludeAd = true;
            for (const key of Object.keys(this.filters)) {
              const filter = this.filters[key];
              if (filter.selectedOption) {
                if (
                  !detailedAd.additional ||
                  detailedAd.additional[key] !== filter.selectedOption
                ) {
                  shouldIncludeAd = false;
                  break;
                }
              }
            }
            if (shouldIncludeAd) {
              this.ads.push(detailedAd);
            }
            if (adsProcessed === ads.length) {
              //console.log('All ads processed. Final ads list:', this.ads);
            }
          });
        });
        this.ads = [];
      });
    } else {
      this.ads = [];
      this.getAdsList();
    }
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
    this.currentPage = 1;
    this.paginateAds();
  }
}
