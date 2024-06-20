import { Component, Inject, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AnnonceService } from '../annonce.service';
import { DOCUMENT } from '@angular/common';
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
  constructor(
    private route: ActivatedRoute,
    private annonceService: AnnonceService,
    @Inject(DOCUMENT) private document: Document,
    private categotyService: CategoryService,
    private sanitizer: DomSanitizer,
    private settingService: SettingService,
    private categoryService: CategoryService,
    private routers: Router
  ) {}
  countsAds = 0;
  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id !== null) {
        this.adId = id;

        console.log('trrtrtrt', this.adId);
        if (
          this.document.defaultView &&
          this.document.defaultView.localStorage
        ) {
          const accessToken =
            this.document.defaultView.localStorage.getItem('loggedInUserToken');
          // Fetch ad details
          this.annonceService.getAdById(this.adId).subscribe((data) => {
            this.adDetail = data.data;
            this.categoryService
              .getCategoryById(data.data.category_id)
              .subscribe((category) => {
                const modelFields = category.data.model_fields;
                const queryParams = { model: category.data.model };

                this.settingService
                  .getSettings(accessToken!, queryParams)
                  .subscribe(
                    (setting) => {
                      if (setting.data) {
                        console.log('setting.data', setting.data);

                        // Transform modelFields into transformedFields with initial structure
                        const transformedFields = Object.keys(modelFields).map(
                          (key) => ({
                            value: key,
                            label: modelFields[key].label,
                            setting: key, // Initialize setting with key, you'll update this later
                            type: modelFields[key].type,
                            options: modelFields[key].options,
                          })
                        );

                        transformedFields.forEach((field) => {
                          // Check if options are defined and type is 'select'
                          if (
                            !modelFields[field.value].options &&
                            modelFields[field.value].type === 'select'
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
                                console.log('Updated setting:', field.setting);
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
                            modelFields[field.value].type === 'date'
                          ) {
                            field.setting = data.data.additional[field.value];
                          } else if (modelFields[field.value].options) {
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
                          } else if (modelFields[field.value].type === 'bool') {
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
                          }
                        });

                        this.transformedField = transformedFields;
                        console.log(
                          'Transformed fields with updated settings:',
                          transformedFields
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

            console.log('datarrr', data);

            // Count ads where adDetail.user.id matches
            // Initialize count variable outside of the subscription
            let count = 0;

            // Create an array to store all inner observables
            const innerObservables: Observable<any>[] = [];

            this.annonceService.getAds().subscribe((adsData) => {
              let relatedAdsTemp: any[] = [];
              // Iterate over each ad
              adsData.data.forEach((ad: { id: any }) => {
                // Push each inner observable to the array
                innerObservables.push(this.annonceService.getAdById(ad.id));
              });
              console.log('ads detail', adsData);
              adsData.data.forEach((adDetail: { id: string }) => {
                this.annonceService
                  .getAdById(adDetail.id)
                  .subscribe((adDetails) => {
                    if (adDetails.data.user_id == this.adDetail.user_id) {
                      count++;
                    }

                    if (
                      adDetails.data.category.id == this.adDetail.category.id
                    ) {
                      this.relatedAds.push(adDetails.data);
                    }

                    console.log(
                      'Count of ads associated with the user:',
                      count
                    );
                    this.countsAds = count;
                    console.log(
                      'adDetails',
                      adDetails.data.user_id,
                      this.adDetail.user_id
                    );
                  });
              });
              if (relatedAdsTemp.length > 0) {
                this.relatedAds = this.shuffleArray(relatedAdsTemp).slice(0, 4);
              }
              console.log('annooo related ', this.relatedAds);
              // Use forkJoin to wait for all inner observables to complete
              /*                 forkJoin(innerObservables).subscribe((adDetails) => {
                  // Iterate over each ad detail
                  adDetails.forEach((adDetail) => {
                    console.log(' ad:', adDetail);
                    // Check if the user ID of the current ad matches the user ID of adDetail
                    if (adDetail.data.user.id === this.adDetail.user.id) {
                      // Increment count if user IDs match
                      count++;
                      console.log(
                        'User associated with ad:',
                        adDetail.data.user.id,
                        this.adDetail.user.id
                      );
                    }
                  });

                  // Log the count after all inner observables have completed
                  console.log('Count of ads associated with the user:', count);
                  this.countsAds = count;
                  console.log(
                    'Count of ads associated with the eeuser:',
                    this.countsAds
                  );
                }); */
            });
          });
        }
        // Utilisez maintenant this.adId pour obtenir l'ID de l'annonce
      }
    });
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
