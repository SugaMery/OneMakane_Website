import {
  Component,
  HostListener,
  Inject,
  OnInit,
  PLATFORM_ID,
  SimpleChanges,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AnnonceService } from '../annonce.service';
import { CategoryService } from '../category.service';
import { SettingService } from '../setting.service';
import { Observable } from 'rxjs/internal/Observable';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { PrimeNGConfig } from 'primeng/api';
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
  conditions: any[];
  options: any;
  route: any;
  table: any;
  content: any;
  label: string;
  type: string;
  help: string;
  ordre: number;
}

interface ModelFields {
  [key: string]: ModelField;
}

interface StringIndexed {
  [key: string]: string;
}

interface Setting {
  key: any;
  id: number;
  name: string;
  model: string;
  content: string;
  created_at: string;
  selectedOption?: SelectedOption;
  label?: string;
  optionsVisible?: boolean;
  type: string;
  selectedOptions: any[];
  order: number;
  dependant?: string;
  contentDepend?: {
    [key: string]: {
      [key: string]: string;
    };
  };
  depend: boolean;
  dependValue: string | undefined;
  conditions: [];
}

interface SelectedOption {
  value: string;
  label: string;
  name?: string;
  id?: number;
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

type Status = 'approved' | 'pending' | 'draft' | 'rejected';

@Component({
  selector: 'app-edit-ads',
  templateUrl: './edit-ads.component.html',
  styleUrl: './edit-ads.component.css',
})
export class EditAdsComponent implements OnInit {
  ad: any = {};
  categories: Category[] = [];
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
  count: number = 0;
  adDetail: any = [];
  transformedField:
    | { value: string; label: any; setting: string }[]
    | undefined;
  relatedAds: any[] = [];
  settings: any;
  settingcontent: any[] = [];
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adService: AnnonceService,
    private categoryService: CategoryService,
    private annonceService: AnnonceService,
    private settingsService: SettingService,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object,
    private primengConfig: PrimeNGConfig
  ) {}
  adId: string = '';
  uploadedImages: string[] = [];
  deletedImages: string[] = [];
  statusMapping = {
    approved: 'Approuvé',
    pending: 'En attente',
    draft: 'Brouillon',
    rejected: 'Rejeté',
  };
  maxImages = false;
  selectedFiles: File[] = [];
  selectedSubCategory: any | null = null;
  optionsVisible: boolean = false;

  ngOnInit(): void {
    // this.initializeAd();
    this.settings = [];
    const adId = this.route.snapshot.paramMap.get('id');
    this.adService.getAdById(adId!).subscribe((data) => {
      this.ad = data.data;
      this.uploadedImages = this.ad.medias;
      const modelFields = this.ad.category.model_fields;
      const queryParams = { model: this.ad.category.model };

      this.categoryService.getCategoriesFrom().subscribe(
        (categories) => {
          this.categories = categories.data.filter(
            (category: Category) =>
              category.active === true && category.parent_id !== null
          );
          this.categories.forEach((category) => {
            this.enrichCategoryWithParentAndModelFields(category);
          });

          if (this.ad?.category) {
            this.selectedOption = this.categories.find(
              (category) => this.ad.category.id === category.id
            );
          } else {
            console.error('Ad category is undefined');
          }
        },
        (error) => {
          console.error('Error fetching categories: ', error);
        }
      );

      const accessToken = localStorage.getItem('loggedInUserToken');
      console.log(
        'rrrerere',
        this.selectedOption,
        modelFields,
        queryParams,
        accessToken,
        this.ad
      );
      this.fetchSetting(accessToken!, queryParams, modelFields);
    });
    this.subscribeToRouteParams();
    this.categories.forEach((categorie) => {
      if (this.ad.category.id == categorie.id) {
        console.log('greeeeeeeeeeeeeeeeeetttttttt', this.ad);
        //this.selectedOption = categorie;
      }
    });

    this.fetchCategories();
    //this.fetchSettings();
    console.log('adddd', this.ad);

    this.primengConfig.setTranslation({
      firstDayOfWeek: 1,
      dayNames: [
        'dimanche',
        'lundi',
        'mardi',
        'mercredi',
        'jeudi',
        'vendredi',
        'samedi',
      ],
      dayNamesShort: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
      dayNamesMin: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
      monthNames: [
        'janvier',
        'février',
        'mars',
        'avril',
        'mai',
        'juin',
        'juillet',
        'août',
        'septembre',
        'octobre',
        'novembre',
        'décembre',
      ],
      monthNamesShort: [
        'janv.',
        'févr.',
        'mars',
        'avr.',
        'mai',
        'juin',
        'juil.',
        'août',
        'sept.',
        'oct.',
        'nov.',
        'déc.',
      ],
      today: "Aujourd'hui",
      clear: 'Effacer',
      dateFormat: 'dd/mm/yy',
      weekHeader: 'Sm',
    });
  }
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const targetElement = event.target as HTMLElement;
    const isCategoryOpen = !!targetElement.closest('.select-btn');
    const isStateOpen = !!targetElement.closest('.select-menu .select-btn');

    if (!isCategoryOpen && !isStateOpen) {
      this.optionsVisible = false;
    }
    if (!this.isDescendant(targetElement, 'select-menu')) {
      // Close all select menus
      this.settings.forEach((setting: any) => {
        setting.optionsVisible = false;
      });
    }
  }
  private isDescendant(element: HTMLElement, className: string): boolean {
    let currentElement: HTMLElement | null = element;
    while (currentElement) {
      if (currentElement.classList.contains(className)) {
        return true;
      }
      currentElement = currentElement.parentElement;
    }
    return false;
  }

  initializeAd(): void {
    const adId = this.route.snapshot.paramMap.get('id');
    if (adId) {
      this.adService.getAdById(adId).subscribe((data) => {
        this.ad = data.data;
        this.uploadedImages = this.ad.medias;
        const modelFields = this.ad.category.model_fields;
        const queryParams = { model: this.ad.category.model };
        const accessToken = localStorage.getItem('loggedInUserToken');
        //console.log('rrrerere',modelFields,queryParams,accessToken)
        this.fetchSetting(accessToken!, queryParams, modelFields);
      });
    }
  }

  subscribeToRouteParams(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.adId = id;
        this.handleLocalStorage(id);
      }
    });
  }

  handleLocalStorage(id: string): void {
    if (isPlatformBrowser(this.platformId)) {
      const accessToken = localStorage.getItem('loggedInUserToken');
      if (accessToken) {
        this.adService.getAdById(this.adId).subscribe((data) => {
          this.adDetail = data.data;
          this.fetchCategoryAndSettings(
            data.data.category_id,
            accessToken,
            data.data.additional
          );
          this.fetchRelatedAds(data.data.user_id, data.data.category.id);
        });
      }
    }
  }
  boolSettings: any[] = [];
  marquesPopulaires: Array<{ id: number; name: string }> = [];
  autresMarques: Array<{ id: number; name: string }> = [];

  transformData(data: any): Array<{ id: number; name: string }> {
    return Object.entries(data).map(([key, value]) => ({
      id: +key,
      name: value as string,
    }));
  }
  date!: string;

  populateSettingsWithAdData() {
    this.settings.forEach((setting: Setting) => {
      const adValue = this.ad.additional[setting.key];
      if (adValue !== undefined) {
        switch (setting.type) {
          case 'select':
            if (setting.dependant) {
              const value = this.ad.additional[setting.dependant];
              const content = setting.content[value];
              setting.depend = true;
              setting.dependValue = value;
              setting.selectedOption = {
                label: content[adValue],
                value: adValue,
              };
              //console.log('jaberaphane',setting)
            } else {
              //console.log("selelelelelel" ,adValue ,this.ad.additional[adValue])
              setting.selectedOption = {
                label: setting.content[adValue],
                value: adValue,
              };
            }

            break;
          case 'text':
          case 'number':
          case 'int':
            setting.content = adValue;
            setting.depend = true;
            break;
          case 'bool':
            setting.depend = true;
            setting.content = adValue.toString();
            break;
          case 'multiple':
            //console.log("multiplekkkkkk",adValue,setting)
            try {
              const adArray = JSON.parse(adValue);
              const list: { label: string; value: any }[] = [];
              if (Array.isArray(adArray)) {
                adArray.forEach((ff: any) => {
                  //console.log("ggggttyuiyuyiuyiyu", ff);
                  // Additional logic here

                  list.push({
                    label: setting.content[ff],
                    value: ff,
                  });
                  setting.selectedOptions = list;

                  /*            console.log("multii",setting,{
                        label: setting.content[ff],
                        value: ff
                      },list); */
                });
              } else {
                console.error('Parsed adValue is not an array:', adArray);
                // Handle the case where parsed adValue is not an array, if needed
              }
            } catch (error) {
              console.error('Error parsing adValue:', error);
              // Handle parsing error, if necessary
            }

            //setting.selectedOptions = this.parseMultipleOptions(setting.content, adValue);
            break;
        }
      }
    });
  }

  parseOptionLabel(content: any, value: any): string {
    if (Array.isArray(content)) {
      const option = content.find((opt: any) => opt.value === value);
      return option ? option.label : 'Choisissez';
    }
    return 'Choisissez';
  }

  parseMultipleOptions(content: any, value: string): any[] {
    if (Array.isArray(content)) {
      const values = value.split(',');
      return values
        .map((val) => content.find((opt: any) => opt.value === val))
        .filter((opt) => opt);
    }
    return [];
  }
  fetchSetting(
    accessToken: string,
    queryParams: any,
    modelFields: { [x: string]: any }
  ): void {
    const settingsOption = Object.keys(modelFields).map((key, index) => ({
      key,
      value: modelFields[key],
      order: index,
    }));

    settingsOption.forEach((field) => {
      if (field.value && typeof field.value === 'object') {
        if ('route' in field.value) {
          this.settingsService
            .createMarque(field.value.route, accessToken!)
            .subscribe((response) => {
              if (response.status === 'Success' && response.data) {
                this.marquesPopulaires = this.transformData(
                  response.data['Marques populaires']
                );
                this.autresMarques = this.transformData(
                  response.data['Autres marques']
                );

                field.value.content = [
                  {
                    label: 'Marques Populaires',
                    content: this.marquesPopulaires,
                  },
                  { label: 'Autres Marques', content: this.autresMarques },
                ];

                const newSetting = {
                  name: field.value.label,
                  label: field.value.label,
                  content: field.value.content,
                  optionsVisible: false,
                  type: 'table',
                  key: field.key,
                  order: field.order,
                  depend: null,
                };

                this.addSettingInOrder(newSetting);
              }
            });
        } else if (field.value.type === 'select' && !field.value.options) {
          this.settingsService
            .getSettings(accessToken!, queryParams)
            .subscribe((setting) => {
              setting.data.forEach((data: { content: any; name: string }) => {
                if (data.name === field.key) {
                  if (field.value.dependant) {
                    const newSetting = {
                      name: field.value.label,
                      label: field.value.label,
                      content: data.content,
                      optionsVisible: false,
                      type: 'select',
                      key: field.key,
                      order: field.order,
                      contentDepend: data.content,
                      dependant: field.value.dependant,
                      depend: false,
                    };
                    this.addSettingInOrder(newSetting);
                  } else {
                    const newSetting = {
                      name: field.value.label,
                      label: field.value.label,
                      content: data.content,
                      optionsVisible: false,
                      type: 'select',
                      key: field.key,
                      order: field.order,
                      dependant: field.value.dependant,
                      depend: null,
                    };
                    this.addSettingInOrder(newSetting);
                  }
                }
              });
            });
        } else if (field.value.type === 'date') {
          if (field.value.conditions) {
            const newSetting = {
              name: field.value.label,
              label: field.value.label,
              content: this.date,
              optionsVisible: false,
              type: 'date',
              key: field.key,
              order: field.order,
              depend: false,
              conditions: field.value.conditions,
            };
            this.addSettingInOrder(newSetting);
          } else {
            const newSetting = {
              name: field.value.label,
              label: field.value.label,
              content: this.date,
              optionsVisible: false,
              type: 'date',
              key: field.key,
              order: field.order,
              depend: null,
            };
            this.addSettingInOrder(newSetting);
          }
        } else if (
          field.value.type === 'text' ||
          field.value.type === 'number'
        ) {
          if (field.value.conditions) {
            const newSetting = {
              name: field.value.label,
              label: field.value.label,
              content: field.value.content,
              optionsVisible: false,
              type: field.value.type,
              key: field.key,
              order: field.order,
              depend: false,
              conditions: field.value.conditions,
            };
            this.addSettingInOrder(newSetting);
          } else {
            const newSetting = {
              name: field.value.label,
              label: field.value.label,
              content: field.value.content,
              optionsVisible: false,
              type: field.value.type,
              key: field.key,
              order: field.order,
              depend: null,
            };
            this.addSettingInOrder(newSetting);
          }
        } else if (field.value.type === 'multiple') {
          this.settingsService
            .getSettings(accessToken!, queryParams)
            .subscribe((setting) => {
              setting.data.forEach((data: { content: any; name: string }) => {
                if (data.name === field.key) {
                  const newSetting = {
                    name: field.value.label,
                    label: field.value.label,
                    content: data.content,
                    optionsVisible: false,
                    selectedOptions: [],
                    type: 'multiple',
                    key: field.key,
                    order: field.order,
                    depend: null,
                  };
                  this.addSettingInOrder(newSetting);
                }
              });
            });
        } else if (field.value.options) {
          const newSetting = {
            name: field.value.label,
            label: field.value.label,
            content: field.value.options,
            optionsVisible: false,
            type: 'options',
            key: field.key,
            order: field.order,
            depend: null,
          };
          this.addSettingInOrder(newSetting);
        } else if (field.value.type === 'bool') {
          if (field.value.conditions) {
            const newSetting = {
              name: field.value.label,
              label: field.value.label,
              content: field.value.options,
              optionsVisible: false,
              type: field.value.type,
              key: field.key,
              order: field.order,
              depend: false,
              conditions: field.value.conditions,
            };
            this.boolSettings.push(newSetting);
          } else {
            const newSetting = {
              name: field.value.label,
              label: field.value.label,
              content: field.value.options,
              optionsVisible: false,
              type: field.value.type,
              key: field.key,
              order: field.order,
              depend: null,
            };
            this.boolSettings.push(newSetting);
          }
        } else if (field.value.type === 'int') {
          const newSetting = {
            name: field.value.label,
            label: field.value.label,
            content: field.value.content,
            optionsVisible: false,
            type: field.value.type,
            key: field.key,
            order: field.order,
            depend: false,
            conditions: field.value.conditions,
          };
          this.addSettingInOrder(newSetting);
        }
        if (this.ad.additional[field.key]) {
          if (field.value.type === 'int') {
            field.value.content = this.ad.additional[field.key];
            field.value.depend = true;
          }
        }
      }
    });

    // Add bool settings last to ensure correct order
    this.boolSettings.forEach((setting: any) =>
      this.addSettingInOrder(setting)
    );
    // Log each setting with its key
    settingsOption.forEach((setting, index) => {
      //console.log(`Setting ${index}:`, setting);
    });

    //console.log('this.settings', this.settings,settingsOption, this.boolSettings);
  }

  addSettingInOrder(newSetting: any): void {
    // Find the correct position based on order
    //console.log("gooo1",this.settings)

    const index = this.settings.findIndex(
      (s: { order: number }) => s.order > newSetting.order
    );
    if (index === -1) {
      this.settings.push(newSetting); // Append if no larger order is found
    } else {
      this.settings.splice(index, 0, newSetting); // Insert at the correct position
      //this.settingcontent.splice(index, 0, newSetting);
    }
    this.populateSettingsWithAdData();
  }

  fetchCategoryAndSettings(
    categoryId: string,
    accessToken: string,
    additionalData: any
  ): void {
    this.categoryService.getCategoryById(categoryId).subscribe((category) => {
      const modelFields = category.data.model_fields;
      const queryParams = { model: category.data.model };

      //this.fetchSetting(accessToken, queryParams, modelFields);
    });
  }

  transformFields(
    modelFields: any,
    settingsData: any,
    additionalData: any
  ): void {
    const transformedFields = Object.keys(modelFields).map((key) => ({
      value: key,
      label: modelFields[key].label,
      setting: key,
    }));

    transformedFields.forEach((field) => {
      const matchedSetting = settingsData.find(
        (settingItem: { name: string }) => settingItem.name === field.value
      );
      if (matchedSetting) {
        if (additionalData && additionalData[field.value]) {
          field.setting = matchedSetting.content[additionalData[field.value]];
        } else {
          console.error(
            `No setting found for key '${field.value}' in additionalData`
          );
        }
      }
    });

    this.transformedField = transformedFields;
  }
  toggledOptionsDepend(setting: Setting): void {
    this.settings.forEach((s: any) => {
      if (s !== setting) {
        s.optionsVisible = false;
      }
      if (s.key === setting.dependant) {
        // Assuming `content` is properly typed in Setting
        console.log('Content of selected option:', setting.content);
        //setting.contentDepend = setting.content;
        if (s.selectedOption?.value) {
          var selectedOptionValue =
            setting.contentDepend![s.selectedOption?.value];
          //setting.content
          console.log(
            `Value of key '}':`,
            selectedOptionValue,
            s.key,
            setting.dependant
          );
        }
      }
    });

    setting.optionsVisible = !setting.optionsVisible;
  }

  depend!: string | undefined;
  selectedOptionName: any;

  selectdOptiondDepend(option: any, setting: Setting): void {
    setting.selectedOption = option;
    this.settings.forEach((s: any) => {
      if (setting.key === s.dependant) {
        this.depend = setting.selectedOption?.value;
        s.depend = true;
        s.dependValue = setting.selectedOption?.value.toString();
      }
      const val = setting.selectedOption?.value.toString();
    });

    //this.selectedOptionName = option.name
    setting.optionsVisible = false;
  }
  updateSetting(setting: any, value: boolean) {
    setting.content = value;
    // Any additional logic to handle the updated setting
  }

  inputFocused: boolean = false;
  filteredOptions: {
    label: number;
    filteredContent: { id: number; name: string }[];
  }[] = [];
  parseOptions1(
    content: string | StringIndexed
  ): { id: number; name: string }[] {
    if (Array.isArray(content)) {
      return content.map((item) => ({
        id: item.id,
        name: item.name,
      }));
    } else {
      return [];
    }
  }

  parseOptions2(
    content: string | StringIndexed
  ): { label: number; content: string }[] {
    if (Array.isArray(content)) {
      return content.map((item) => ({
        label: item.label,
        content: item.content,
      }));
    } else {
      return [];
    }
  }

  toggleOptionr(setting: any) {
    setting.optionsVisible = !setting.optionsVisible;
    if (!setting.optionsVisible) {
      this.inputFocused = false; // Reset inputFocused when closing options
    }
  }

  trackByOptioned(index: number, item: any): any {
    return item.label;
  }

  selectOptionr(option: any, setting: any) {
    this.selectedOptionName = option.name;
    setting.selectedOption = option;
    setting.optionsVisible = false;
    this.inputFocused = false; // Reset inputFocused when an option is selected
  }
  hasFilteredOptions(): boolean {
    return this.filteredOptions.some(
      (optioned) => optioned.filteredContent.length > 0
    );
  }
  trackByOption(index: number, item: any): any {
    return item.id;
  }

  get locale() {
    return this.primengConfig.translation;
  }
  // Method to handle input events and filter options
  onInput(event: Event, setting: any): void {
    const inputElement = event.target as HTMLInputElement;

    // Check if the input element ID is "table"
    if (inputElement.id === 'table') {
      const input = inputElement.value.trim().toLowerCase();
      setting.inputValue = input;

      // Filter options based on input value
      this.filteredOptions = this.parseOptions2(setting.content).map(
        (optioned) => ({
          label: optioned.label,
          filteredContent: this.parseOptions1(optioned.content).filter(
            (option) => option.name.toLowerCase().includes(input)
          ),
        })
      );

      this.inputFocused = input.length > 0; // Set inputFocused based on input value
    }
  }
  fetchRelatedAds(userId: string, categoryId: string): void {
    let count = 0;
    const innerObservables: Observable<any>[] = [];

    this.adService.getAds().subscribe((adsData) => {
      adsData.data.forEach((ad: { id: any }) => {
        innerObservables.push(this.adService.getAdById(ad.id));
      });

      adsData.data.forEach((adDetail: { id: string }) => {
        this.adService.getAdById(adDetail.id).subscribe((adDetails) => {
          if (adDetails.data.user_id == this.adDetail.user_id) {
            count++;
          }
          if (adDetails.data.category.id == this.adDetail.category.id) {
            this.relatedAds.push(adDetails.data);
          }
        });
      });
    });
  }

  fetchSettings(): void {
    if (typeof localStorage !== 'undefined') {
      const queryParams = { model: this.selectedOption.model };
      const accessToken = localStorage.getItem('loggedInUserToken');

      if (!accessToken) {
        console.error('Access token is missing.');
        return;
      }
      this.settingsService.getSettings(accessToken, queryParams).subscribe(
        (response: any) => {
          const modelFields = this.selectedOption.model_fields || {};
          const keys = Object.keys(modelFields);
          this.settings = [];
          this.settings = response.data.map((setting: Setting) => {
            const name = setting.name;
            let label = '';

            if (keys.includes(name)) {
              label = modelFields[name].label;
            }

            let transformedSetting = null;
            if (this.transformedField) {
              this.transformedField.forEach((trans) => {
                if (trans.label === label) {
                  transformedSetting = {
                    content: setting.content,
                    optionsVisible: false,
                    label: label,
                    name: setting.name,
                    setting: trans.setting,
                  };
                }
              });
            }
            console.log('transformedField', this.transformedField);

            return (
              transformedSetting || {
                content: setting.content,
                optionsVisible: false,
                label: label,
                name: setting.name,
                setting: setting,
              }
            );
          });
        },
        (error) => {
          console.error('Error fetching settings:', error);
        }
      );
    }
  }

  onFileSelected(event: any): void {
    const maxImagesAllowed = 3;
    const files: FileList = event.target.files;
    if (files && files.length > 0) {
      if (this.uploadedImages.length + files.length > maxImagesAllowed) {
        this.maxImages = true;
        return;
      }
      for (let i = 0; i < files.length; i++) {
        const file: File = files[i];
        const reader: FileReader = new FileReader();
        this.selectedFiles.push(file);
        reader.onload = (e) => {
          const imageDataURL: string = e.target!.result as string;
          this.uploadedImages.push(imageDataURL);
        };
        reader.readAsDataURL(file);
      }
    }
  }

  modifier(): void {
    if (typeof localStorage !== 'undefined') {
      const queryParams = { model: this.selectedOption.model };
      const accessToken = localStorage.getItem('loggedInUserToken');

      if (!accessToken) {
        console.error('Access token is missing.');
        return;
      }
      this.uploadFilesAndUpdateAnnonce(accessToken);
    }
  }

  createSetting(settingADS: { [key: string]: any }, accessToken: string): void {
    this.annonceService
      .insertSetting(this.adId, 'ad-models', settingADS, accessToken)
      .subscribe(
        () => {
          //this.uploadFilesAndUpdateAnnonce(accessToken);
        },
        (error) => {
          console.error('Error creating setting:', error);
        }
      );
  }

  uploadFilesAndUpdateAnnonce(accessToken: string): void {
    const mediaIds: string[] = this.uploadedImages
      .filter((image: any) => image.url)
      .map((image: any) => image.id);

    Promise.all(
      this.selectedFiles.map((file) =>
        this.annonceService.uploadFile(file, accessToken).then((response) => {
          mediaIds.push(response.data.id);
        })
      )
    )
      .then(() => {
        const annonceData = this.createAnnonceData(mediaIds);
        this.annonceService
          .updateAnnonce(this.adId, this.ad.uuid, annonceData, accessToken)
          .subscribe(
            () => {
              const settingADS: { [key: string]: any } =
                this.buildSettingsData();

              this.annonceService
                .UpdateSetting(this.adId, settingADS, accessToken)
                .subscribe(
                  () => {
                    // Handle successful settings update
                    window.location.href = '/page-account#orders';
                  },
                  (error) => {
                    console.error('Error updating settings:', error);
                    if (error.error.message === "This AdBook doesn't exist") {
                      this.createSetting(settingADS, accessToken);
                    }
                  }
                );
            },
            (error) => {
              console.error('Error updating annonce:', error);
            }
          );
      })
      .catch((error) => {
        console.error('Error uploading files:', error);
      });
  }

  private buildSettingsData(): { [key: string]: any } {
    const settingADS: { [key: string]: any } = {};

    for (const setting of this.settings) {
      switch (setting.type) {
        case 'text':
        case 'number':
        case 'select':
        case 'options':
        case 'int':
          settingADS[setting.key] = setting.selectedOption
            ? setting.selectedOption.value
            : setting.content;
          break;
        case 'table':
          settingADS[setting.key] = setting.selectedOption?.id;
          break;
        case 'bool':
          settingADS[setting.key] =
            setting.content === true || setting.content === 'true' ? 1 : 0;
          break;
        case 'multiple':
          settingADS[setting.key] = setting.selectedOptions.map(
            (option: any) => option.value
          );
          break;
        case 'date':
          const date = new Date(this.date);
          setting.content = this.formatDate(date);
          settingADS[setting.key] = setting.content;
          break;
      }
    }

    return settingADS;
  }

  createAnnonceData(mediaIds: string[]): any {
    return {
      user_id: this.ad.user.id,
      category_id: this.ad.category.id,
      title: this.ad.title,
      description: this.ad.description,
      state: this.ad.state,
      urgent: this.ad.urgent,
      highlighted: this.ad.highlighted,
      price: parseFloat(this.ad.price),
      city: this.ad.city,
      postal_code: this.ad.postal_code,
      medias: { _ids: mediaIds },
      validation_status: 'pending',
    };
  }
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2); // Months are zero-based
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  parseOptions(
    content: string | StringIndexed
  ): { value: string; label: string }[] {
    if (typeof content === 'string') {
      const options = JSON.parse(content);
      return typeof options === 'object' && options !== null
        ? Object.keys(options).map((key) => ({
            value: key,
            label: options[key],
          }))
        : [];
    } else if (typeof content === 'object') {
      return Object.keys(content).map((key) => ({
        value: key,
        label: content[key],
      }));
    } else {
      return [];
    }
  }

  fetchCategories(): void {
    this.categoryService.getCategoriesFrom().subscribe(
      (categories) => {
        this.categories = categories.data.filter(
          (category: Category) =>
            category.active === true && category.parent_id !== null
        );
        this.categories.forEach((category) => {
          this.enrichCategoryWithParentAndModelFields(category);
        });

        if (this.ad?.category) {
          this.selectedOption = this.categories.find(
            (category) => this.ad.category.id === category.id
          );
        } else {
          console.error('Ad category is undefined');
        }
      },
      (error) => {
        console.error('Error fetching categories: ', error);
      }
    );
  }

  enrichCategoryWithParentAndModelFields(category: Category): void {
    const parentId = category.parent_id?.toString();
    const Id = category.id?.toString();
    if (parentId) {
      this.categoryService
        .getCategoryById(parentId)
        .subscribe((parent) => (category.parentCategoy = parent.data));
    }
    if (Id) {
      this.categoryService
        .getCategoryById(Id)
        .subscribe(
          (parent) => (category.model_fields = parent.data!.model_fields)
        );
    }
  }
  selectdOptionds(option: any, setting: Setting): void {
    setting.selectedOption = option;

    this.settings.forEach((s: any) => {
      if (setting.key === s.dependant) {
        this.depend = setting.selectedOption?.value;
        s.depend = true;
        s.dependValue = setting.selectedOption?.value.toString();
      }

      const val = setting.selectedOption?.value.toString();

      if (Array.isArray(s.conditions)) {
        s.depend = false; // Initialize s.depend to false

        for (let i = 0; i < s.conditions.length; i++) {
          if (s.conditions[i] === val) {
            s.depend = true;
            break; // Exit the loop early if condition is met
          } else {
            // Option to remove the entire element from settings array
            //this.settings.splice(this.settings.indexOf(s), 1);
            //s.depend=false;
            //break; // Exit the loop after removing the element
          }
        }
      }
    });

    // Uncomment if needed
    // this.selectedOptionName = option.name;
    setting.optionsVisible = false;
  }
  selectdOptiond(option: any, setting: Setting): void {
    setting.selectedOption = option;

    this.settings.forEach((s: any) => {
      if (setting.key === s.dependant) {
        delete s.selectedOption;
        this.depend = setting.selectedOption?.value;
        s.depend = true;
        s.dependValue = setting.selectedOption?.value.toString();
      }

      const val = setting.selectedOption?.value.toString();

      if (Array.isArray(s.conditions)) {
        s.depend = false; // Initialize s.depend to false

        for (let i = 0; i < s.conditions.length; i++) {
          if (s.conditions[i] === val) {
            s.depend = true;
            break; // Exit the loop early if condition is met
          } else {
            // Option to remove the entire element from settings array
            //this.settings.splice(this.settings.indexOf(s), 1);
            //s.depend=false;
            //break; // Exit the loop after removing the element
          }
        }
      }
    });

    // Uncomment if needed
    // this.selectedOptionName = option.name;
    setting.optionsVisible = false;
  }
  toggleOptions(): void {
    this.optionsVisible = !this.optionsVisible;
  }

  toggledOptions(setting: Setting): void {
    this.settings.forEach((s: any) => {
      if (s !== setting) {
        s.optionsVisible = false;
      }
    });
    setting.optionsVisible = !setting.optionsVisible;
  }
  showButton: boolean = false;

  checkAdCreationDate() {
    const adCreationDate = new Date(this.ad.created_at);
    const currentDate = new Date();
    const timeDifference = currentDate.getTime() - adCreationDate.getTime();
    const hoursDifference = timeDifference / (1000 * 3600);

    this.showButton = hoursDifference < 24;
  }
  selectOption(category: any): void {
    this.selectedOption = category;
    if (this.selectedOption) {
      this.formData.category_id = category.id;
      this.settings = [];
      this.boolSettings = [];
      this.fetchCategories();
      //console.log("gooopppp",category,this.settings)

      const modelFields = category.model_fields;
      const queryParams = { model: category.model };
      const accessToken = localStorage.getItem('loggedInUserToken');

      this.fetchSetting(accessToken!, queryParams, modelFields);
      //this.fetchSettings();
      //this.handleLocalStorage(this.a);
    } else {
      if (this.selectedSubCategory!.id) {
        this.formData.category_id = this.selectedSubCategory!.id;
      }
    }
    this.optionsVisible = false;
    console.log('gooo15', this.settings);
  }
  // Inside your component class
  toggleOptionsGO(setting: any) {
    setting.optionsVisible = !setting.optionsVisible;
  }

  getSelectedLabels(setting: any): string {
    return setting.selectedOptions
      .map((option: { label: any }) => option.label)
      .join(', ');
  }

  isOptionSelected(option: any, setting: any): boolean {
    return setting.selectedOptions.some(
      (selected: { value: any }) => selected.value === option.value
    );
  }

  selectOptionGO(option: any, setting: any) {
    const index = setting.selectedOptions.findIndex(
      (selected: { value: any }) => selected.value === option.value
    );
    if (index !== -1) {
      setting.selectedOptions.splice(index, 1); // Deselect option
    } else {
      setting.selectedOptions.push(option); // Select option
    }
  }
  toggleOption(option: any, setting: any) {
    // Implement your toggle logic here
    // For example, toggle the selected state of the option
    option.selected = !option.selected;
    // Add any additional logic you need
  }

  deleteImage(index: number) {
    if (index > -1 && index < this.uploadedImages.length) {
      const deletedImage = this.uploadedImages.splice(index, 1)[0];
      this.selectedFiles.splice(index - this.count, 1)[0];
      if (!this.deletedImages.includes(deletedImage)) {
        this.deletedImages.push(deletedImage);
      }
    }
  }

  replaceImage(index: number) {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.addEventListener('change', (event: any) => {
      const files: FileList = event.target.files;
      if (files && files.length > 0) {
        const file: File = files[0];
        const reader: FileReader = new FileReader();
        reader.onload = (e) => {
          const imageDataURL: string = e.target!.result as string;
          this.uploadedImages[index] = imageDataURL;
          const deletedIndex = this.deletedImages.indexOf(imageDataURL);
          if (deletedIndex !== -1) {
            this.deletedImages.splice(deletedIndex, 1);
          }
        };
        reader.readAsDataURL(file);
      }
    });
    fileInput.click();
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'draft':
        return 'p-tag p-tag-draft';
      case 'pending':
        return 'p-tag p-tag-warning';
      case 'approved':
        return 'p-tag p-tag-success';
      case 'rejected':
        return 'p-tag p-tag-danger';
      default:
        return '';
    }
  }

  toggleHighlighted() {
    this.ad.highlighted = !this.ad.highlighted;
  }
  toggleUrgent() {
    this.ad.urgent = !this.ad.urgent;
  }

  getStatusInFrench(status: Status): string {
    return this.statusMapping[status];
  }

  formatPublishedAt(dateString: string): string {
    if (!dateString) {
      return ''; // Handle case where dateString is empty or undefined
    }

    const date = new Date(dateString);

    // Check if date is invalid
    if (isNaN(date.getTime())) {
      console.error('Invalid date string:', dateString);
      return ''; // Handle invalid date string
    }

    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    };

    return new Intl.DateTimeFormat('fr-FR', options)
      .format(date)
      .replace(',', ' à');
  }

  onSubmit() {}
}
