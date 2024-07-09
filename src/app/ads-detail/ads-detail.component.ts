import { Component, Inject, Input, OnInit, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AnnonceService } from '../annonce.service';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CategoryService } from '../category.service';
import { SettingService } from '../setting.service';
import { Observable, forkJoin } from 'rxjs';

@Component({
  selector: 'app-ads-detail',
  templateUrl: './ads-detail.component.html',
  styleUrl: './ads-detail.component.css',
})
export class AdsDetailComponent implements OnInit {
  categories: any[] = [];
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
  }

  adId: string = '';
  adDetail: any = [];
  transformedField:
    | {
        type: any;
        value: string;
        label: any;
        setting: string;
      }[]
    | undefined;
  relatedAds: any[] = [];
  router: any;
  responsiveOptions:
    | { breakpoint: string; numVisible: number; numScroll: number }[]
    | undefined;
  constructor(
    private route: ActivatedRoute,
    private annonceService: AnnonceService,
    @Inject(DOCUMENT) private document: Document,
    private categotyService: CategoryService,
    private sanitizer: DomSanitizer,
    private settingService: SettingService,
    private categoryService: CategoryService,
    private routers: Router,
    @Inject(PLATFORM_ID) private platformId: any
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.checkScreenWidth();
      // Listen to window resize event only in browser environment
      window.addEventListener('resize', () => this.checkScreenWidth());
    }
  }
  isScreenSmall!: boolean;
  isScreenphone: boolean = false;

  countsAds = 0;
  checkScreenWidth() {
    if (isPlatformBrowser(this.platformId)) {
      this.isScreenSmall = window.innerWidth < 1600 && window.innerWidth > 992;
      this.isScreenphone = window.innerWidth < 500;
    }
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
  getFormattedDate(datetime: string | undefined): string {
    if (!datetime) {
      return ''; // or handle the case when datetime is undefined
    }
    return datetime.split('T')[0];
  }
  polygon: google.maps.Polygon | undefined; // Declare a variable for polyline
  map: google.maps.Map | undefined;
  initMap(): void {
    const geocoder = new google.maps.Geocoder();
    const mapElement = document.getElementById('map') as HTMLElement; // Assertion de type

    if (!mapElement) {
      console.error('Élément de carte introuvable !');
      return;
    }

    const map = new google.maps.Map(mapElement, {
      center: { lat: 31.6295, lng: -7.9811 }, // Centre par défaut (Marrakech, Maroc)
      zoom: 12,
    });

    // Remplacez par votre adDetail.postal_code
    const postalCode = this.adDetail.postal_code;

    // Géocodez le code postal
    geocoder.geocode(
      { address: postalCode + ', Morocco' },
      (results, status) => {
        if (status === 'OK' && results![0]) {
          const location = results![0].geometry.location;
          const bounds =
            results![0].geometry.bounds || results![0].geometry.viewport;

          // Crée et affiche le rectangle
          const rectangle = new google.maps.Rectangle({
            bounds: bounds,
            map: map,
            strokeColor: '#3BB77E',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#5ef29252', // Couleur de remplissage verte
            fillOpacity: 0.35,
          });

          // Centre la carte sur la localisation du code postal
          map.fitBounds(bounds);

          // Positionne l'icône personnalisée au centre du rectangle
          const center = bounds.getCenter();
          const icon = {
            url: '../../assets/imgs/icone.png', // Path to your custom icon
            scaledSize: new google.maps.Size(100, 100), // Adjust size if necessary
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(50, 50),
          };
          const marker = new google.maps.Marker({
            position: center,
            map: map,
            icon: icon,
            draggable: false,
            animation: google.maps.Animation.DROP,
          });
        } else {
          console.error(
            'Le géocodage a échoué pour la raison suivante : ' + status
          );
        }
      }
    );
  }
  ngOnInit() {
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
    this.fetchCategories();
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id !== null) {
        this.adId = id;

        if (
          this.document.defaultView &&
          this.document.defaultView.localStorage
        ) {
          const accessToken =
            this.document.defaultView.localStorage.getItem('loggedInUserToken');
          // Fetch ad details
          this.annonceService.getAdById(this.adId).subscribe((data) => {
            this.adDetail = data.data;
            this.initMap();
            console.log('modelfilds', data);

            this.categoryService
              .getCategoryById(data.data.category_id)
              .subscribe((category) => {
                const modelFields = category.data.model_fields;
                const queryParams = { model: category.data.model };
                console.log('modelfilds', modelFields);
                this.settingService
                  .getSettings(accessToken!, queryParams)
                  .subscribe(
                    (setting) => {
                      if (setting.data) {
                        // Transform modelFields into transformedFields with initial structure
                        const transformedFields = Object.keys(modelFields).map(
                          (key) => ({
                            value: key,
                            label: modelFields[key].label,
                            setting: key, // Initialize setting with key, you'll update this later
                            type: modelFields[key].type,
                            options: modelFields[key].options,
                            dependant: modelFields[key].dependant,
                          })
                        );
                        transformedFields.forEach((field) => {
                          // Check if options are defined and type is 'select'
                          // Check if options are defined and type is 'select'
                          if (modelFields[field.value].route) {
                            const fieldValue =
                              data.data.additional[field.value];
                            // Perform the service call with the appropriate route and accessToken
                            this.settingService
                              .createMarque(
                                modelFields[field.value].route,
                                accessToken!
                              )
                              .subscribe((response) => {
                                // Extract the relevant categories
                                const marquesPopulaires =
                                  response.data['Marques populaires'];
                                const autresMarques =
                                  response.data['Autres marques'];

                                // Convert objects to arrays
                                const marquesPopulairesArray = Object.entries(
                                  marquesPopulaires
                                ).map(([key, value]) => ({
                                  id: key,
                                  name: value,
                                }));
                                const autresMarquesArray = Object.entries(
                                  autresMarques
                                ).map(([key, value]) => ({
                                  id: key,
                                  name: value,
                                }));

                                // Combine arrays if needed
                                const allMarquesArray = [
                                  ...marquesPopulairesArray,
                                  ...autresMarquesArray,
                                ];

                                // Filter the array to find the item with the specified ID
                                const filteredResponse = allMarquesArray.filter(
                                  (item: { id: string }) =>
                                    item.id === String(fieldValue)
                                );

                                // Handle the filtered response
                                if (filteredResponse.length > 0) {
                                  field.setting =
                                    filteredResponse[0].name!.toString();
                                }
                              });
                          } else if (
                            !modelFields[field.value].options &&
                            modelFields[field.value].type === 'select' &&
                            !modelFields[field.value].dependant
                          ) {
                            // Apply the logic for 'get setting'
                            const matchedSetting = setting.data.find(
                              (settingItem: { name: string }) =>
                                settingItem.name === field.value
                            );

                            if (matchedSetting) {
                              if (
                                data.data.additional &&
                                data.data.additional[field.value]
                              ) {
                                field.setting =
                                  matchedSetting.content[
                                    data.data.additional[field.value]
                                  ];
                              } else {
                                console.error(
                                  `No additional data found for key '${field.value}'`
                                );
                              }
                            } else {
                              console.error(
                                `No setting found for key '${field.value}'`,
                                field,
                                modelFields
                              );
                            }
                          } else if (
                            modelFields[field.value].type === 'number' ||
                            modelFields[field.value].type === 'text' ||
                            modelFields[field.value].type === 'date' ||
                            modelFields[field.value].type === 'int'
                          ) {
                            field.setting = data.data.additional[field.value];
                          } else if (
                            modelFields[field.value].options &&
                            modelFields[field.value].type !== 'bool'
                          ) {
                            field.setting =
                              modelFields[field.value].options[
                                data.data.additional[field.value]
                              ];
                            console.error(
                              `No setting found for key '${field.value}'`,
                              field,
                              modelFields
                            );
                            // Apply the logic when options are not defined or type is not 'select'
                          } else if (
                            modelFields[field.value].type === 'multiple'
                          ) {
                            try {
                              field.setting = JSON.parse(
                                data.data.additional[field.value]
                              );
                            } catch (error) {
                              console.error('Error parsing JSON:', error);
                            }
                          } else if (
                            modelFields[field.value].type === 'bool' &&
                            modelFields[field.value].conditions
                          ) {
                            field.setting =
                              data.data.additional[field.value] === 1
                                ? 'Oui'
                                : 'Non';
                          } else if (modelFields[field.value].dependant) {
                            const model = modelFields[field.value].dependant;
                            console.log(
                              'depent',
                              modelFields[field.value],
                              data.data.additional[model],
                              modelFields[model],
                              transformedFields
                            );
                            const matchedSetting = setting.data.find(
                              (settingItem: { name: string }) =>
                                settingItem.name === field.value
                            );
                            console.log(
                              'matchi',
                              matchedSetting,
                              matchedSetting.content[
                                data.data.additional[model]
                              ]
                            );
                            if (matchedSetting) {
                              if (
                                data.data.additional &&
                                data.data.additional[field.value]
                              ) {
                                const test =
                                  matchedSetting.content[
                                    data.data.additional[model]
                                  ];
                                field.setting =
                                  test[data.data.additional[field.value]];
                                console.log('matchitttt', field.setting, test);
                              } else {
                                console.error(
                                  `No additional data found for key '${model}'`
                                );
                              }
                            } else {
                              console.error(
                                `No setting found for key '${field.value}'`,
                                field,
                                modelFields
                              );
                            }
                          }
                        });

                        this.transformedField = transformedFields.filter(
                          (fild) => fild.value !== 'need_cv'
                        );
                      } else {
                        console.error('No data found in settings.');
                      }
                    },
                    (error) => {
                      console.error('Error fetching settings:', error);
                    }
                  );
              });

            // Count ads where adDetail.user.id matches
            // Initialize count variable outside of the subscription
            let count = 0;

            // Create an array to store all inner observables
            const innerObservables: Observable<any>[] = [];
            const userId = localStorage.getItem('loggedInUserId');

            this.annonceService
              .getAdsWithFavoris(Number(userId))
              .subscribe((adsData) => {
                let relatedAdsTemp: any[] = [];
                let count = 0;

                // Parcourt chaque annonce
                adsData.data.forEach((ad: { id: any; favorites: any }) => {
                  // Ajoute chaque observable interne au tableau
                  innerObservables.push(this.annonceService.getAdById(ad.id));
                });

                // Utilisation de forkJoin pour attendre que tous les observables internes soient complétés
                forkJoin(innerObservables).subscribe((adDetails) => {
                  adDetails.forEach((adDetail: any) => {
                    // Ajoute les favoris à l'annonce
                    adDetail.data.favorites = adsData.data.find(
                      (ad: { id: any }) => ad.id === adDetail.data.id
                    ).favorites;

                    // Incrémente le compteur si l'ID de l'utilisateur de l'annonce correspond
                    if (adDetail.data.user_id == this.adDetail.user_id) {
                      count++;
                    }

                    // Ajoute les annonces à relatedAds si la catégorie correspond
                    if (
                      adDetail.data.category.id == this.adDetail.category.id
                    ) {
                      relatedAdsTemp.push(adDetail.data);
                    }
                  });

                  // Mise à jour du compteur des annonces
                  this.countsAds = count;

                  // Mélange et sélectionne jusqu'à 4 annonces reliées
                  if (relatedAdsTemp.length > 0) {
                    this.relatedAds = this.shuffleArray(relatedAdsTemp).slice(
                      0,
                      4
                    );
                  }
                });
              });
          });
        }
        // Utilisez maintenant this.adId pour obtenir l'ID de l'annonce
      }
    });
    this.initMap();
  }
  goToChat(): void {
    this.routers.navigate(['/chat', this.adDetail.id]);
  }

  shuffleArray(array: any[]): any[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
  // Fonction pour formater la date
  formatDate(dateString: string): string {
    const options: Intl.DateTimeFormatOptions = {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
      timeZoneName: 'short',
    };

    const formattedDate = new Date(dateString).toLocaleString('fr-FR', options);
    return formattedDate;
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
  getMapUrl(city: string): SafeResourceUrl {
    const apiKey = 'AIzaSyAgd5AQZWYpCZYv9S0WEnQLGGu1dardz_s';
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.google.com/maps/embed/v1/place?q=${city}&key=${apiKey}`
    );
  }
}
