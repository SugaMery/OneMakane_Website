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
import { UserService } from '../user.service';

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
  selector: 'app-compte-vendor',
  templateUrl: './compte-vendor.component.html',
  styleUrl: './compte-vendor.component.css',
})
export class CompteVendorComponent {
  currentPage = 1;
  totalPages = 1;
  ads: any[] = [];
  isScreenSmall!: boolean;
  isScreenphone: boolean = false;
  sortOption = 'featured';
  filteredAds: any[] = [];
  originalAds: any[] = [];
  userInfo: any;

  constructor(
    private categoryService: CategoryService,
    private annonceService: AnnonceService,
    private userService: UserService,
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
  adsPerPage = 10;

  getPagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (v, k) => k + 1);
  }

  changePage(page: number): void {
    console.log("Changing to page: ", page); // Debug log
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.currentPage = page;
    this.paginateAds();
  }

  changeAdsPerPage(count: number): void {
    console.log("Changing ads per page to: ", count); // Debug log
    this.adsPerPage = count;
    this.currentPage = 1;
    this.paginateAds();
  }
  paginatedAds :any = [];
  paginateAds(): void {
    this.totalPages = Math.ceil(this.ads.length / this.adsPerPage);
    console.log("Total pages: ", this.totalPages); // Debug log
    const startIndex = (this.currentPage - 1) * this.adsPerPage;
    const endIndex = startIndex + this.adsPerPage;
    console.log("Paginating ads from index ", startIndex, " to ", endIndex); // Debug log
    this.paginatedAds = this.ads.slice(startIndex, endIndex);
    console.log("Paginated ads: ", this.paginatedAds); // Debug log
  }
  addToFavorites(ad: any): void {
    const userId = localStorage.getItem('loggedInUserId');
    const accessToken = localStorage.getItem('loggedInUserToken');

    // Vérifiez si l'utilisateur est connecté
    if (!userId || !accessToken) {
      // Rediriger vers la page de connexion
      window.location.href = '/login';
      return;
    }

    // Check if the ad is already in favorites
    const isFavorited = ad.favorites.length > 0;

    if (isFavorited) {
      // Remove from favorites
      const favoriteId = ad.favorites[0].id; // Assuming `id` is the identifier for the favorite
      this.annonceService
        .removeFromFavorites(favoriteId, accessToken)
        .subscribe(
          (response) => {
            // Remove favorite locally
            ad.favorites = [];
            console.log('Removed from favorites successfully:', response);
          },
          (error) => {
            console.error('Failed to remove from favorites:', error);
          }
        );
    } else {
      // Add to favorites
      this.annonceService
        .addToFavorites(Number(userId), ad.id, accessToken)
        .subscribe(
          (response) => {
            // Add favorite locally
            ad.favorites = [
              {
                ad_id: response.data.ad_id,
                id: response.data.id,
                created_at: response.data.created_at,
              },
            ];
            console.log('Added to favorites successfully:', response);
          },
          (error) => {
            console.error('Failed to add to favorites:', error);
          }
        );
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



  getAdsList(): void {
    this.annonceService.getAllAdsWithUser(Number(this.userId)).subscribe((datas) => {
      let ads = datas;
      let adsProcessed = 0;
  
      this.originalAds = [];
      this.ads = []; // Reset this.ads before processing
  
      ads.forEach((element: { id: string }) => {
        this.annonceService.getAdById(element.id).subscribe((data) => {
          adsProcessed++;
          const detailedAd = data.data;
          if (detailedAd.user.id === Number(this.userId)) {
            this.ads.push(detailedAd);
            this.originalAds.push(detailedAd);
          }
          console.log('Filtered ads:', this.ads);
          this.totalPages = Math.ceil(this.ads.length / this.adsPerPage);
          this.paginateAds();
          // Check if all ads have been processed
          if (adsProcessed === ads.length) {
            // Now this.ads and this.originalAds should contain filtered ads

          }
        });
      });
    });
  }
  
  userId!: string;
  uuId!: string;

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const accessToken = localStorage.getItem('loggedInUserToken');

      this.userId = this.route.snapshot.params['userId'];
      this.uuId = this.route.snapshot.params['uuId'];

      console.log('User ID:', this.userId);
      this.getAdsList();
      this.userService
        .getUserInfoByIdVendor(Number(this.userId), this.uuId, accessToken!)
        .subscribe((userInfo: any) => {
          this.userInfo = userInfo.data;
          console.log('user info', userInfo);
        });
    }
  }
}
