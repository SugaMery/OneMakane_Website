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
  selector: 'app-favois',
  templateUrl: './favois.component.html',
  styleUrl: './favois.component.css',
})
export class FavoisComponent {
  currentPage = 1;
  totalPages = 1;
  ads: any[] = [];
  adsPerPage = 10;
  isScreenSmall!: boolean;
  isScreenphone: boolean = false;
  sortOption = 'featured';
  filteredAds: any[] = [];
  originalAds: any[] = [];

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
  checkScreenWidth() {
    if (isPlatformBrowser(this.platformId)) {
      this.isScreenSmall = window.innerWidth < 1600 && window.innerWidth > 992;
      this.isScreenphone = window.innerWidth < 500;
    }
  }

  changeSortOption(option: string): void {
    this.sortOption = option;
    this.applyFilters();
  }

  applyFilters(): void {
    this.sortAds();
    this.paginateAds();
  }
  removeFromFavoris(ad: any): void {
    const accessToken = localStorage.getItem('loggedInUserToken');

    if (!accessToken) {
      console.error('No access token found. Please log in.');
      return;
    }

    if (!ad.favorites || ad.favorites.length === 0) {
      console.error('This ad is not in the favorites list.');
      return;
    }

    const favoriteId = ad.favorites[0].id; // Assuming `id` is the identifier for the favorite

    this.annonceService.removeFromFavorites(favoriteId, accessToken).subscribe(
      (response) => {
        // Remove favorite locally
        ad.favorites = [];
        console.log('Removed from favorites successfully:', response);

        // Remove ad from the list of ads
        const index = this.ads.indexOf(ad);
        if (index !== -1) {
          this.ads.splice(index, 1);
        }
      },
      (error) => {
        console.error('Failed to remove from favorites:', error);
      }
    );
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

  getAdsList(): void {
    const userId = localStorage.getItem('loggedInUserId');

    if (userId) {
      this.annonceService
        .getAdsWithFavoris(Number(userId))
        .subscribe((datas) => {
          const ads = datas.data.filter((ad: any) => ad.favorites.length > 0);
          let adsProcessed = 0;

          this.originalAds = [];
          this.ads = [];

          ads.forEach((element: { favorites: any; id: string }) => {
            this.annonceService.getAdById(element.id).subscribe((data) => {
              adsProcessed++;
              const detailedAd = data.data;
              data.data.favorites = element.favorites;

              this.originalAds.push(detailedAd);
              this.ads.push(detailedAd);

              if (adsProcessed === ads.length) {
                console.log('All ads processed:', this.ads);
              }
            });
          });
        });
    } else {
      console.error('No user ID found in local storage.');
    }
  }

  ngOnInit(): void {
    this.getAdsList();
  }
}
