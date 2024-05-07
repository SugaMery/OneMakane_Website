import { Component, Inject, OnInit } from '@angular/core';
import { CategoryService } from '../category.service';
import { DOCUMENT } from '@angular/common';
import { AnnonceService } from '../annonce.service';
import { Console } from 'console';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css',
})
export class HomePageComponent implements OnInit {
  categories: any[] = [];
  Souscategories: any[] = [];
  displayedCategories: any[] = [];
  hiddenCategories: any[] = [];
  showMore: boolean = false;
  ads: any[] = [];
  adsLivres: any[] = [];
  adsVehicules: any[] = [];
  firstad: any = {};
  adsArray: any[] = [];
  categorizedAds: { [key: string]: any[] } = {}; // Define categorizedAds property
  currentIndex: number | undefined; // Initialize as undefined
  responsiveOptions:
    | { breakpoint: string; numVisible: number; numScroll: number }[]
    | undefined;
  responsiveOptions2:
    | { breakpoint: string; numVisible: number; numScroll: number }[]
    | undefined;
  constructor(
    private categoryService: CategoryService,
    private annonceService: AnnonceService,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit(): void {
    this.getAdsForCarousel();
    this.getCategories();
    this.responsiveOptions = [
      {
        breakpoint: '1024px',
        numVisible: 3,
        numScroll: 3,
      },
      {
        breakpoint: '768px',
        numVisible: 2,
        numScroll: 2,
      },
      {
        breakpoint: '560px',
        numVisible: 2,
        numScroll: 1,
      },
    ];
    this.responsiveOptions2 = [
      {
        breakpoint: '1024px',
        numVisible: 3,
        numScroll: 3,
      },
      {
        breakpoint: '768px',
        numVisible: 2,
        numScroll: 2,
      },
      {
        breakpoint: '560px',
        numVisible: 2,
        numScroll: 1,
      },
    ];

    if (this.document.defaultView && this.document.defaultView.localStorage) {
      const accessToken =
        this.document.defaultView.localStorage.getItem('loggedInUserToken');
      if (accessToken) {
        this.annonceService.getAds(accessToken!).subscribe((data) => {
          this.ads = data.data;

          // Clear previous categorized ads
          this.categorizedAds = {};

          data.data.forEach((element: any) => {
            this.annonceService
              .getAdById(element.id, accessToken!)
              .subscribe((adData) => {
                element.image = adData.data.image;

                if (!this.categorizedAds[element.category.name]) {
                  this.categorizedAds[element.category.name] = []; // Initialize array if category doesn't exist
                }
                this.categorizedAds[element.category.name].push(adData.data); // Push ad to respective category
                console.log('categorizedAds', this.categorizedAds);
              });
          });
        });
      }
    }
    this.convertAdsToArray();
  }
  isPhone(): boolean {
    const screenWidth = window.innerWidth;
    if (screenWidth <= 768) {
      return true;
    } else {
      return false;
    }
  }
  sortByCreatedAtDescending(category: any): any[] {
    return category.value.sort((a: any, b: any) => {
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });
  }
  convertAdsToArray() {
    for (let category in this.categorizedAds) {
      if (this.categorizedAds.hasOwnProperty(category)) {
        this.categorizedAds[category] = this.categorizedAds[category].map(
          (ad) => {
            return {
              id: ad.id,
              title: ad.title,
              image: ad.image,
              price: ad.price,
              category: ad.category.name,
              created_at: ad.created_at,
            };
          }
        );
      }
    }
  }

  getAdsForCarousel(): any[] {
    let adsArray: any[] = [];
    console.log('ggggggrettttttt', adsArray);
    // Iterate over categorizedAds and push ads into the adsArray
    for (const category in this.categorizedAds) {
      if (Object.prototype.hasOwnProperty.call(this.categorizedAds, category)) {
        adsArray = adsArray.concat(this.categorizedAds[category]);
      }
    }
    console.log('ggggggrettttttt2', adsArray);

    return adsArray;
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

  getCategories(): void {
    if (this.document.defaultView && this.document.defaultView.localStorage) {
      const accessToken =
        this.document.defaultView.localStorage.getItem('loggedInUserToken');
      if (accessToken) {
        this.categoryService.getCategoriesFrom().subscribe((categories) => {
          this.categories = categories.data.filter(
            (category: { active: boolean; parent_id: null }) =>
              category.active === true && category.parent_id === null
          );
          this.Souscategories = categories.data.filter(
            (category: { active: boolean; parent_id: null }) =>
              category.active === true && category.parent_id !== null
          );

          // Check if the first element of Souscategories has the media property
          if (
            this.Souscategories &&
            this.Souscategories.length > 0 &&
            this.Souscategories[0].media
          ) {
            // Add console log to check if the media property exists

            // Check if the media object has the url property
            if (this.Souscategories[0].media.url) {
              // Log the URL to the console
              console.log(
                'Souscategories 2 URL:',
                this.Souscategories[0].media.url
              );
            } else {
              console.log('URL property does not exist in media object');
            }
          } else {
            console.log(
              'Media property or Souscategories array does not exist or is empty'
            );
          }
          this.displayedCategories = this.categories.slice(0, 11);
          this.hiddenCategories = this.categories.slice(11);
        });
      }
    }
  }

  toggleShowMore(): void {
    this.showMore = !this.showMore;
  }
  colors = ['bg-9', 'bg-10', 'bg-11', 'bg-12', 'bg-13', 'bg-14', 'bg-15']; // Define your colors here

  calculateBgColor(category: any, categories: any[]): string {
    const index = categories.indexOf(category);
    return this.colors[index % this.colors.length];
  }
}
