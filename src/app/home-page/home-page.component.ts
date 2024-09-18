import {
  Component,
  HostListener,
  Inject,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { CategoryService } from '../category.service';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { AnnonceService } from '../annonce.service';
import { Console } from 'console';
import { SettingService } from '../setting.service';
import { Carousel } from 'primeng/carousel';
import { interval, Subscription } from 'rxjs';
interface Product {
  id: number;
  category: { id: number; name: string; route: string | null };
  city: string;
  deleted_at: string | null;
  deleted_reason: string | null;
  deleted_reason_id: string | null;
  image: string | undefined;
  medias: { url: string }[]; // Assuming medias is an array of objects with a 'url' property
  postal_code: string;
  price: string;
  published_at: string | null;
  title: string;
  urgent: boolean;
  validation_status: string;
}
@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css',
})
export class HomePageComponent {
  categories: any[] = [];
  Souscategories: any[] = [];
  Souscategorie: any[] = [];

  displayedCategories: any[] = [];
  hiddenCategories: any[] = [];
  showMore: boolean = false;
  ads: any[] = [];
  adsAll: any[] = [];

  ads_jobs: any[] = [];
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
    private settingService: SettingService,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: any
  ) {
    Carousel.prototype.onTouchMove = () => {};
  }
  transformedField:
    | { value: string; label: any; setting: string }[]
    | undefined;
  adsProduct = [];
  products = [
    {
      name: 'Seeds of Change Organic Quinoa, Brown',
      category: 'Hodo Foods',
      price: 238.85,
      oldPrice: 245.8,
      sold: 90,
      total: 120,
      imageUrl1: '../../assets/imgs/shop/product-1-1.jpg',
      imageUrl2: '../../assets/imgs/shop/product-1-2.jpg',
      rating: 80,
    },
    {
      name: 'Seeds of Change Organic Quinoa, Brown',
      category: 'Hodo Foods',
      price: 238.85,
      oldPrice: 245.8,
      sold: 90,
      total: 120,
      imageUrl1: '../../assets/imgs/shop/product-1-1.jpg',
      imageUrl2: '../../assets/imgs/shop/product-1-2.jpg',
      rating: 80,
    },
    {
      name: 'Seeds of Change Organic Quinoa, Brown',
      category: 'Hodo Foods',
      price: 238.85,
      oldPrice: 245.8,
      sold: 90,
      total: 120,
      imageUrl1: '../../assets/imgs/shop/product-1-1.jpg',
      imageUrl2: '../../assets/imgs/shop/product-1-2.jpg',
      rating: 80,
    },
    // Add more products here if needed
  ];
  isScreenSmall!: boolean;
  isScreenphone: boolean = false;

  private adsRefreshSubscription: Subscription | undefined;
  adsToShow: any[] = [];
  private currentInde: number = 0;
  adsPromote: any[] = [];
  private adsInterval: any;
  adsSubscription: Subscription | undefined;
  ngOnDestroy(): void {
    // Unsubscribe from interval when component is destroyed to prevent memory leaks
    if (this.adsSubscription) {
      this.adsSubscription.unsubscribe();
    }
  }

  // Fetch the ads data from the service
  loadAds(): void {
    this.annonceService.getAdsPromoteAll().subscribe((response) => {
      console.log('Fetched ads:', response);

      if (Array.isArray(response.data)) {
        // Shuffle the response array to get random ads
        this.adsPromote = this.getRandomAds(response.data, 6);
        console.log('Random ads:', this.adsPromote);
      }
    });
  }

  // Function to shuffle the array and return a specific number of random elements
  getRandomAds(ads: any[], count: number): any[] {
    // Shuffle array using Fisher-Yates shuffle algorithm
    for (let i = ads.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ads[i], ads[j]] = [ads[j], ads[i]]; // Swap elements
    }
    // Return the first 'count' elements
    return ads.slice(0, count);
  }

  // Start rotating the ads every 60 seconds (60000 milliseconds)
  startAdsRotation(): void {
    this.adsSubscription = interval(60000).subscribe(() => {
      this.currentInde += 2; // Move to the next set of ads
      if (this.currentInde >= this.adsPromote.length) {
        this.currentIndex = 0; // Reset to the beginning if we reach the end
      }
      this.updateAdsToShow(); // Update the ads to be shown
    });
  }

  // Update the ads that are being displayed
  updateAdsToShow(): void {
    // Show the next 2 ads starting from the currentIndex
    this.adsToShow = this.adsPromote.slice(
      this.currentInde,
      this.currentInde + 2
    );

    // If fewer than 2 ads are available at the end, wrap around to the beginning
    if (this.adsToShow.length < 2 && this.adsPromote.length > 2) {
      this.adsToShow = this.adsToShow.concat(
        this.adsPromote.slice(0, 2 - this.adsToShow.length)
      );
    }
  }
  navigateToCategory(categoryId: number, slug: string) {
    window.location.href = `/ads-category/${categoryId}/${slug}`;
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

  isFavorited(ad: any): boolean {
    return ad.favorites && ad.favorites.length > 0;
  }
  ngOnInit(): void {
    this.getAdsForCarousel();
    this.fetchCategories();
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
    if (isPlatformBrowser(this.platformId)) {
      this.checkScreenWidth();
      // Listen to window resize event only in browser environment
      window.addEventListener('resize', () => this.checkScreenWidth());
    }
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
      const userId =
        this.document.defaultView.localStorage.getItem('loggedInUserId');
      //this.ads = data.data;
      console.log('userid', userId);
      this.annonceService.getAds().subscribe((dt) => {
        this.adsAll = dt.data;
      });
      let listCategory = [
        141, // Offres d'emploi
        142, // Personnel de maison
        145, // Formations professionnelles
      ];
      for (let i = 0; i < listCategory.length; i++) {
        this.categoryService
          .getAllAdsWithFavoris(Number(userId), listCategory[i])
          .subscribe((dataFilter) => {
            console.log('ads_jobs', dataFilter);
            dataFilter.forEach((jobs) => {
              this.annonceService.getAdById(jobs.id).subscribe((jobsData) => {
                this.ads_jobs.push(jobsData.data);
              });
            });
          });
      }
      if (userId) {
        let listCategory = [
          197, // Offres d'emploi
          215, // Personnel de maison
          171, // Formations professionnelles
          150, // Ventes immobilières
          234, // Locations
          148, // Électroménagers
        ];
        for (let i = 0; i < listCategory.length; i++) {
          this.categoryService
            .getAllAdsWithFavoris(Number(userId), listCategory[i])
            .subscribe((dataFilter) => {
              this.ads = dataFilter;
              console.log('ggg dataFilter', dataFilter);

              dataFilter.forEach((element: any) => {
                this.annonceService
                  .getAdById(element.id)
                  .subscribe((adData) => {
                    if (!adData || !adData.data) {
                      return;
                    }

                    this.isFavorited(element);
                    if (adData.data.category.model == jobs) {
                      this.ads_jobs.push(adData.data);
                    }
                    element.image = adData.data.image;
                    if (!this.categorizedAds[element.category.name]) {
                      this.categorizedAds[element.category.name] = [];
                    }
                    adData.data.favorites = element.favorites;
                    console.log('adData.data.length', adData.data);

                    this.categorizedAds[element.category.name].push(
                      adData.data
                    );
                  });
              });
            });
        }
      } else {
        let listCategory = [
          197, // Offres d'emploi
          215, // Personnel de maison
          171, // Formations professionnelles
          150, // Ventes immobilières
          234, // Locations
          148, // Électroménagers
        ];
        for (let i = 0; i < listCategory.length; i++) {
          this.categoryService
            .getAllAdsWithFavoris(Number(userId), listCategory[i])
            .subscribe((data) => {
              this.ads = data;
              console.log('ggg dataFilter', data);

              data.forEach((element: any) => {
                this.annonceService
                  .getAdById(element.id)
                  .subscribe((adData) => {
                    if (!adData || !adData.data) {
                      return;
                    }

                    if (adData.data.category.model == jobs) {
                      this.ads_jobs.push(adData.data);
                    }
                    element.image = adData.data.image;
                    if (!this.categorizedAds[element.category.name]) {
                      this.categorizedAds[element.category.name] = [];
                    }
                    this.categorizedAds[element.category.name].push(
                      adData.data
                    );

                    this.categoryService
                      .getCategoryById(adData.data.category_id)
                      .subscribe((category) => {
                        if (
                          !category ||
                          !category.data ||
                          !category.data.model_fields
                        ) {
                          return;
                        }
                        const modelFields = category.data.model_fields;
                        const queryParams = { model: category.data.model };

                        if (
                          this.document.defaultView &&
                          this.document.defaultView.localStorage
                        ) {
                          const accessToken =
                            this.document.defaultView.localStorage.getItem(
                              'loggedInUserToken'
                            );
                          this.settingService
                            .getSettings(accessToken!, queryParams)
                            .subscribe(
                              (setting) => {
                                if (!setting || !setting.data) {
                                  return;
                                }
                                const transformedFields = Object.keys(
                                  modelFields
                                ).map((key) => ({
                                  value: key,
                                  label: modelFields[key].label,
                                  setting: key,
                                }));

                                transformedFields.forEach(
                                  (field: {
                                    value: string;
                                    label: any;
                                    setting: string;
                                  }) => {
                                    const matchedSetting = setting.data.find(
                                      (settingItem: { name: string }) =>
                                        settingItem.name === field.value
                                    );
                                    if (matchedSetting) {
                                      if (
                                        adData.data.additional &&
                                        adData.data.additional[field.value]
                                      ) {
                                        field.setting =
                                          matchedSetting.content[
                                            adData.data.additional[field.value]
                                          ];
                                        //console.log('jj', field.setting);
                                        //console.log('Transformed f', matchedSetting);
                                      } /*  else {
                                              console.error(`No setting found for key '${field.value}' in data.data.additional`);
                                          } */
                                    }
                                  }
                                );

                                this.transformedField = transformedFields;
                                adData.data.additional = transformedFields;
                              },
                              (error) => {
                                console.error(
                                  'Error fetching settings:',
                                  error
                                );
                              }
                            );
                        }
                      });
                  });
              });
            });
        }
      }
      const jobs = 'ad_jobs';

      this.categorizedAds = {};
    }
    // Define the desired order
    const desiredOrder = [
      'Ventes immobilières',
      'Voitures',
      'Locations',
      'Électroménagers',
      'Téléphone & objets connectés',
      'Vêtements',
    ];

    // Method to sort categories based on desired order
    const sortedCategorizedAds: any = {};

    // Sort categories according to the defined order
    desiredOrder.forEach((categoryName) => {
      if (this.categorizedAds[categoryName]) {
        sortedCategorizedAds[categoryName] = this.categorizedAds[categoryName];
      }
    });

    // Update the instance variable
    this.categorizedAds = sortedCategorizedAds;

    //this.categoryService.getAdsByCategory()
    this.convertAdsToArray();
    this.loadAds();

    console.log('categorizedAds', this.categorizedAds);
  }

  checkScreenWidth() {
    if (isPlatformBrowser(this.platformId)) {
      this.isScreenSmall = window.innerWidth < 1600 && window.innerWidth > 992;
      this.isScreenphone = window.innerWidth < 500;
    }
  }
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
  ngOnChanges() {}
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
    // Iterate over categorizedAds and push ads into the adsArray
    for (const category in this.categorizedAds) {
      if (Object.prototype.hasOwnProperty.call(this.categorizedAds, category)) {
        adsArray = adsArray.concat(this.categorizedAds[category]);
      }
    }

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
      return `${days} jours passés`;
    } else if (days === 1) {
      return `Hier à ${adDate.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
    } else {
      const timeString = adDate.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      });
      return !this.isScreenphone
        ? `Aujourd'hui à ${timeString}`
        : `Auj. à ${timeString}`;
    }
  }

  getCategories(): void {
    if (this.document.defaultView && this.document.defaultView.localStorage) {
      const accessToken =
        this.document.defaultView.localStorage.getItem('loggedInUserToken');

      this.categoryService.getCategoriesFrom().subscribe((categories) => {
        const allCategories = categories.data;

        // Filter active main categories (parent_id === null)
        this.categories = allCategories.filter(
          (category: { active: boolean; parent_id: null }) =>
            category.active === true && category.parent_id === null
        );

        // Filter active subcategories (parent_id !== null)
        this.Souscategories = allCategories.filter(
          (category: { active: boolean; parent_id: number }) =>
            category.active === true && category.parent_id !== null
        );

        // Check if the first element of Souscategories has the media property
        if (
          this.Souscategories &&
          this.Souscategories.length > 0 &&
          this.Souscategories[0].media
        ) {
          if (this.Souscategories[0].media.url) {
            console.log(this.Souscategories[0].media.url);
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

        // Create a list to include subcategories with a reference to their parent category
        this.Souscategorie = this.categories.reduce((acc, category) => {
          const subcategories = this.Souscategories.filter(
            (subCategory) => subCategory.parent_id === category.id
          );
          return acc.concat(
            subcategories.map((subCategory) => ({
              ...subCategory,
              parentCategory: category,
            }))
          );
        }, []);
      });
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
