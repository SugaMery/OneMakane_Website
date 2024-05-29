import { Component, OnInit } from '@angular/core';
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
  categories: any[] = [];
  filteredAd: any[] = [];
  displayedAds: any[] = [];
  adsPerPage = 10;
  sortOption = 'featured';
  currentPage = 1;
  totalPages = 1;
  totalAdsCount = 0;
  constructor(
    private route: ActivatedRoute,
    private annonceService: AnnonceService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id !== null) {
      this.categoryId = +id;
      this.getAds();
    } else {
      // Gérer le cas où l'ID est null, peut-être rediriger ou afficher un message d'erreur
    }
  }

  applyFilters(): void {
    this.sortAds();
    this.paginateAds();
    this.getCategories();
  }
  getAds(): void {
    this.annonceService.getAds().subscribe((ads) => {
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
            this.applyFilters();
          });
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
      console.log('this.categories', this.categories);
    });
  }
  toggleDropdown(event: MouseEvent): void {
    event.stopPropagation();
    const element = event.currentTarget as HTMLElement;
    const dropdown = element.querySelector('.dropdown-menu') as HTMLElement;
    if (dropdown) {
      dropdown.classList.toggle('show');
    }
  }

  optionsVisible: boolean = false;
  selectedOption: Category = {
    active: false,
    created_at: '',
    id: 0,
    model: null,
    name: '',
    parent_id: null,
    slug: null,
    route: null,
    url: null,
    icon_path: '',
  };
  toggleOptions(): void {
    this.optionsVisible = !this.optionsVisible;
  }

  selectOption(option: any): void {
    this.selectedOption = option;
    console.log('option', option);
    this.optionsVisible = false;
  }

  filterByCategory(categoryId: number): void {
    this.filteredAds = []; // Clear previous filtered ads
    this.annonceService.getAds().subscribe((ads) => {
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
}
