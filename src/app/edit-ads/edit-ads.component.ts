import { Component, HostListener, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AnnonceService } from '../annonce.service';
import { CategoryService } from '../category.service';
import { SettingService } from '../setting.service';
import { Observable } from 'rxjs/internal/Observable';
import { DOCUMENT } from '@angular/common';

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
  selector: 'app-edit-ads',
  templateUrl: './edit-ads.component.html',
  styleUrl: './edit-ads.component.css',
})
export class EditAdsComponent {
  ad: any = {};
  categories: any[] = [];
  selectedOption: any = {
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
  adDetail: any = [];
  transformedField:
    | { value: string; label: any; setting: string }[]
    | undefined;
  relatedAds: any[] = [];
  settings: any;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adService: AnnonceService,
    private categoryService: CategoryService,
    private settingsService: SettingService,
    @Inject(DOCUMENT) private document: Document
  ) {}
  adId: string = '';

  ngOnInit(): void {
    const adId = this.route.snapshot.paramMap.get('id');
    this.adService.getAdById(adId!).subscribe((data) => {
      this.ad = data.data;
    });
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
          if (accessToken) {
            // Fetch ad details
            this.adService.getAdById(this.adId).subscribe((data) => {
              this.adDetail = data.data;
              this.categoryService
                .getCategoryById(data.data.category_id)
                .subscribe((category) => {
                  const modelFields = category.data.model_fields;
                  const queryParams = { model: category.data.model };

                  this.settingsService
                    .getSettings(accessToken!, queryParams)
                    .subscribe(
                      (setting) => {
                        if (setting.data) {
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
                                  data.data.additional &&
                                  data.data.additional[field.value]
                                ) {
                                  field.setting =
                                    matchedSetting.content[
                                      data.data.additional[field.value]
                                    ];
                                  console.log('jj', field.setting);
                                  console.log('Transformed f', matchedSetting);
                                } else {
                                  console.error(
                                    `No setting found for key '${field.value}' in data.data.additional`
                                  );
                                }
                              }
                            }
                          );
                          this.transformedField = transformedFields;
                          // = this.transformedField;
                          console.log(
                            'Transformed fields with updated labels:',
                            this.settings
                          );
                        } else {
                          console.error('No data found in settings.');
                        }
                      },
                      (error: any) => {
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

              this.adService.getAds().subscribe((adsData) => {
                let relatedAdsTemp: any[] = [];
                // Iterate over each ad
                adsData.data.forEach((ad: { id: any }) => {
                  // Push each inner observable to the array
                  innerObservables.push(this.adService.getAdById(ad.id));
                });
                console.log('ads detail', adsData);
                adsData.data.forEach((adDetail: { id: string }) => {
                  this.adService
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
                      console.log(
                        'adDetails',
                        adDetails.data.user_id,
                        this.adDetail.user_id
                      );
                    });
                });
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
        }
        // Utilisez maintenant this.adId pour obtenir l'ID de l'annonce
      }
    });
    // console.log('categories categories', this.categories);
    this.categories.forEach((categorie) => {
      if (this.ad.category.id == categorie.id) {
        console.log('greeeeeeeeeeeeeeeeeetttttttt');
        this.selectedOption = categorie;
      }
    });
    this.fetchSettings();
    console.log('Transformed fields with updated labels:', this.settings);
    //console.log('categories categories ad', this.ad.category.name);
  }
  formData = {
    titre: '',
    description: '',
    prix: '',
    category_id: 0,
    state: '',
    genre: '',
    urgent: false,
    highlighted: false,
    ville: '',
    code_postal: '',
    files: [],
  };
  selectedSubCategory: any | null = null;
  fetchSettings(): void {
    const queryParams = { model: this.selectedOption.model };
    const accessToken = localStorage.getItem('loggedInUserToken');

    this.settingsService
      .getSettings(accessToken!, queryParams)
      .subscribe((response: any) => {
        const modelFields: { [key: string]: { label: string } } =
          this.selectedOption.model_fields!;
        const keys = Object.keys(modelFields);
        this.settings = response.data.map((setting: Setting) => {
          const name: string = setting.name;
          const keyExists = keys.includes(name);
          let label = '';
          if (keyExists) {
            label = modelFields[name].label;
          }
          return {
            content: setting.content,
            optionsVisible: false,
            label: label,
            name: setting.name,
          };
        });
        console.log('settings', this.settings);
      });
  }
  onSubmit() {}
  optionsVisible: boolean = false;
  parseOptions(
    content: string | StringIndexed
  ): { value: string; label: string }[] {
    if (typeof content === 'string') {
      const options = JSON.parse(content);
      if (typeof options === 'object' && options !== null) {
        return Object.keys(options).map((key) => ({
          value: key,
          label: options[key],
        }));
      } else {
        return [];
      }
    } else if (typeof content === 'object') {
      return Object.keys(content).map((key) => ({
        value: key,
        label: content[key],
      }));
    } else {
      return [];
    }
  }
  selectdOptiond(option: any, setting: Setting): void {
    setting.selectedOption = option;
    setting.optionsVisible = false;
  }
  toggleOptions(): void {
    this.optionsVisible = !this.optionsVisible;
  }
  toggledOptions(setting: Setting): void {
    this.settings.forEach((s: Setting) => {
      if (s !== setting) {
        s.optionsVisible = false;
      }
    });
    setting.optionsVisible = !setting.optionsVisible;
  }
  selectOption(category: any): void {
    this.selectedOption = category;
    if (this.selectedOption) {
      this.formData.category_id = category.id;
    } else {
      if (this.selectedSubCategory!.id) {
        this.formData.category_id = this.selectedSubCategory!.id;
      }
    }
    this.optionsVisible = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const targetElement = event.target as HTMLElement;
    const isCategoryOpen = !!targetElement.closest('.select-btn');
    const isStateOpen = !!targetElement.closest('.select-menu .select-btn');

    if (!isCategoryOpen && !isStateOpen) {
      this.optionsVisible = false;
    }
  }
}
