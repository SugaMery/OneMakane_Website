import { Component, Renderer2 } from '@angular/core';
import { CategoryService } from '../category.service';
import { AnnonceService } from '../annonce.service';
import { ActivatedRoute } from '@angular/router';

interface Option {
  key: string;       // Unique identifier for the option
  value: string;     // Display value of the option
  checked?: boolean;  // State of the checkbox
}

interface Filter {
  type: string;
  label: string;
  options: { [key: string]: Option };
  dependant?: boolean;
  conditions?: { [key: string]: any };
  selectedOption?: string;
  dropdownOpen?: boolean;
  key? : string;
  selectedOptions: { [key: string]: Option };
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
     this.categories.forEach((category)=>{
      if(category.id == this.category){
        console.log("rrrrr",category)
      }
     })
      
      console.log("eee",this.categories);
    } else {
    }
    // Fetch all query parameters as an object

  }

  getAdsList(): void {
    console.log("adsff",this.allCategoriesSameParent);

    if(this.allCategoriesSameParent.length==0){
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
    }else{
      for(let i=0;i<this.allCategoriesSameParent.length;i++){
        this.annonceService.getAds().subscribe((datas) => {
          let ads = datas.data.filter(
            (ad: { category_id: number }) => ad.category_id === this.allCategoriesSameParent[i].id
          );
          let adsProcessed = 0;
    
          this.originalAds = []; 
    
          ads.forEach((element: { id: string }) => {
            this.annonceService.getAdById(element.id).subscribe((data) => {
              adsProcessed++;
              const detailedAd = data.data;
    
              this.ads.push(detailedAd);
              this.originalAds.push(detailedAd); 
              console.log('adssss',this.ads,this.originalAds);
              if(this.searchTitle){
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
              if(key!=='search'){
                this.selectOptioneds(key,value);

              }else{
                this.searchTitle=value;
                
                console.log("goooofrrrr",this.ads)
 this.getAdsList();
 console.log("goooofrrrr",this.ads)

  
        
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

  selectOption(key: string, option: string) {
    delete this.filters[key].selectedOption ;
    this.getAds();
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

  openmatchingFilters : boolean = false;

  selectOptioneds(filterKey: string, optionKey: string): void {
    this.filters[filterKey].selectedOption = optionKey;
    this.matchingFilters = [];
    for (const key of this.getFilterKeys()) {
      const filter = this.filters[key];
      if (filter.conditions && Array.isArray(filter.conditions)) {
        if (filter.conditions.includes(optionKey.toString())) {
          filter.key = key;
          this.matchingFilters.push(filter);
        }
      }
    }
    this.ads = [];
    this.getAds();
  
    if (this.matchingFilters.length > 0) {
      this.matchingFilters.filter((filter)=>{
        if(filter.type == 'bool' || filter.type == 'multiple'){
          this.openmatchingFilters = true;
         // console.log("tteee",filter.options);
        }
        else{
          this.openmatchingFilters = false;

        }
      })  
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

toggleOption(key: string , filter : any): void {
  if (this.isSelecteds(key)) {
    this.selectedOptions = this.selectedOptions.filter(option => option !== key);

  } else {
    this.selectedOptions.push(key);
  }
  filter.selectedOption = this.selectedOptions ; 
  filter.selectedOptions = this.selectedOptions ;
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
    if (!optionKey || optionKey== null || optionKey == undefined) {
      // Delete selectedOption when event is null
      delete this.filters[filterKey].selectedOption;
      this.getAds();
    } else {
      //console.log('tttuuuuuuu',this.filters,filterKey,optionKey);
      this.filters[filterKey].selectedOption = optionKey;
      this.getAdsSous();
    }
  }


  filterCheck(event: any , filter : any) {
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

  getAdsSous() : void {
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
     if(filter.type == 'int'){
      if(filter.selectedOption <= detailedAd.additional[key]){
        //console.log('ffff',filter,key,detailedAd.additional[key])
        this.ads.push(detailedAd);
      } 
     }else if(filter.selectedOption == detailedAd.additional[key]){
     // console.log('ffff',filter,key,detailedAd)
      this.ads.push(detailedAd);
     }else if (filter.type == 'multiple') {
      for (let i = 0; i < filter.selectedOption.length; i++) {
        if (detailedAd.additional[key] && detailedAd.additional[key].includes(filter.selectedOption[i].toString())) {
         // console.log("greattt", filter.selectedOption[i]);
          if (!this.ads.some(ad => ad === detailedAd)) {
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

    if(this.allCategoriesSameParent.length==0){
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
    }else{
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
