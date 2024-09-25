import {
  Component,
  EventEmitter,
  HostListener,
  OnInit,
  Output,
} from '@angular/core';
import { AuthGuard } from '../auth.guard';
import { UserService } from '../user.service';
import { CategoryService } from '../category.service';
import { AnnonceService } from '../annonce.service';
import { SettingService } from '../setting.service';
import { Router } from '@angular/router';
import { formatDate } from '@angular/common';
import { PrimeNGConfig } from 'primeng/api';
import { OptionsService } from '../options.service';
import * as CryptoJS from 'crypto-js';
declare var $: any;

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
@Component({
  selector: 'app-add-ads',
  templateUrl: './add-ads.component.html',
  styleUrl: './add-ads.component.css',
})
export class AddAdsComponent implements OnInit {
  userInfo: any;
  loggedInUserName: string | undefined;
  deletedImages: string[] = [];
  uploadedImages: string[] = [];
  selectedSubCategory: SubCategory | null = null;
  categories: Category[] = [];
  allcategories: Category[] = [];
  formDataCustom: any = {};
  suggestedCategory!: CustomCategory | null;
  fieldsErrors: { [settingLabel: string]: boolean } = {};
  formData = {
    category_parent_id: 0,
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
  date1: Date | undefined;

  date2: Date | undefined;

  date3: Date | undefined;
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
  uploadedImageIds: number[] = [];
  optionsVisible: boolean = false;
  urgentChecked: boolean = false;
  highlightedChecked: boolean = false;
  uploadedImage: string[] = [];
  selectedFiles: File[] = [];
  representatives: any;
  suggestedCategoryIf: boolean = false;
  suggestedsubcategoryIf: boolean = false;
  suggestedCategorys = [];
  selectedOptiond: any;
  optionsVisibled: boolean = false;
  parent: Category | undefined;
  maxImages = false;
  selectedCategory: any;
  selectedState: any;
  states: any[] = [];
  stateOptionsVisible = false;
  settings: Setting[] = [];
  adDialog: boolean = false;
  selectedAd: any;
  selectedCategoryGenre = false;
  selectedGenre: any;
  genres: any[] = [];
  genreOptionsVisible = false;
  @Output() nextCallback: EventEmitter<any> = new EventEmitter();
  isBakingMaterialChecked: boolean = false;
  minPrix!: number;
  maxPrix!: number;
  adds: any[] = [];
  ads!: any[];
  selectedads!: any[] | null;
  submitted: boolean = false;
  statuses!: any[];
  filteredAds: any[] = [];
  settingsOption: ModelFields | undefined;
  setting: any;
  date!: string;
  categoriesParent: any;
  selectedOptionName: any;
  constructor(
    private authService: AuthGuard,
    private annonceService: AnnonceService,
    private userService: UserService,
    private categoryService: CategoryService,
    private settingsService: SettingService,
    private router: Router,
    private primengConfig: PrimeNGConfig,
    private optionsService: OptionsService
  ) {}
  // Save the form data to localStorage
  saveFormDataToLocalStorage() {
    localStorage.setItem('formData', JSON.stringify(this.formData));
  }

  // Retrieve form data from localStorage on page load
  loadFormDataFromLocalStorage() {
    const savedFormData = localStorage.getItem('formData');
    if (savedFormData) {
      this.formData = JSON.parse(savedFormData);
    }
  }

  // Liste de catégories avec leurs mots-clés associés
  Customcategories: CustomCategory[] = [
    /*     {
      name: 'Immobilier',
      keywords: ['appartement', 'maison', 'terrain'],
      icon_path:
        'https://devmedias.onemakan.com/tmp/1713720468-f1f9e4d9-87a8-49d7-8ed9-d4129d8b6d64.png',
      subcategories: [
        { name: 'Appartements de luxe', keywords: ['luxe', 'penthouse'] },
        { name: 'Maisons avec piscine', keywords: ['piscine', 'jardin'] },
      ],
    },
    {
      name: 'Véhicules',
      keywords: ['voiture', 'moto', 'camion'],
      icon_path:
        'https://devmedias.onemakan.com/tmp/1713720468-f1f9e4d9-87a8-49d7-8ed9-d4129d8b6d64.png',
      subcategories: [
        {
          name: 'Voitures',
          keywords: [
            'Voiture',
            'berline',
            'SUV',
            'coupé',
            'cabriolet',
            'break',
            'monospace',
            'citadine',
            'hybride',
            'électrique',
            'sportive',
            'audi',
            'bmw',
            'citroen',
            'fiat',
            'ford',
            'mercedes-benz',
            'opel',
            'peugeot',
            'renault',
            'volkswagen',
            'abarth',
            'ac',
            'aiways',
            'aixam',
            'alfa romeo',
            'allard',
            'alpine',
            'alpina',
            'aston martin',
            'austin',
            'austin healey',
            'autobianchi',
            'auverland',
            'bentley',
            'bmw-alpina',
            'bugatti',
            'buick',
            'byd',
            'cadillac',
            'casalini',
            'caterham',
            'chevrolet',
            'chevrolet usa',
            'chrysler',
            'cupra',
            'dacia',
            'daewoo',
            'daihatsu',
            'daimler',
            'dangel',
            'datsun',
            'delorean',
            'dodge',
            'ds',
            'ferrari',
            'fisker',
            'ford allemagne',
            'ford angleterre',
            'ford france',
            'ford usa',
            'general motors',
            'honda',
            'hummer',
            'hyundai',
            'imperial',
            'ineos',
            'infiniti',
            'innocenti',
            'isuzu',
            'jaguar',
            'jeep',
            'kia',
            'ktm',
            'lada',
            'lamborghini',
            'lancia',
            'land-rover',
            'lexus',
            'ligier',
            'lincoln',
            'lotus',
            'lynk&co',
            'mahindra',
            'maserati',
            'mazda',
            'mclaren',
            'mega',
            'mercury',
            'mg',
            'mg motor',
            'mia electric',
            'microcar',
            'mini',
            'mitsubishi',
            'morgan',
            'nissan',
            'nsu',
            'oldsmobile',
            'opel',
            'pagani',
            'panhard',
            'peterbilt',
            'peugeot',
            'piaggio',
            'plymouth',
            'pontiac',
            'porsche',
            'rambler',
            'reliant',
            'renault',
            'renault usa',
            'rolls-royce',
            'rover',
            'saab',
            'santana',
            'seat',
            'seres',
            'simca',
            'singer',
            'skoda',
            'smart',
            'ssangyong',
            'subaru',
            'suzuki',
            'talbot',
            'tata',
            'tesla',
            'toyota',
            'triumph',
            'tvr',
            'vauxhall',
            'venturi',
            'vespa',
            'volkswagen',
            'volvo',
            'wiesmann',
            'xiaomi',
            'zastava',
            'zaz',
            'golf',
          ],
        },

        {
          name: 'Motos',
          keywords: [
            'Voiture',
            'sportive',
            'custom',
            'naked',
            'trail',
            'touring',
            'scooter',
            'cross',
            'enduro',
            'street',
            'café racer',
            'aprilia',
            'benelli',
            'beta',
            'bimota',
            'bmw',
            'bullit',
            'brixton',
            'cagiva',
            'cf moto',
            'daelim',
            'derbi',
            'ducati',
            'fantic',
            'fb mondial',
            'gas gas',
            'harley-davidson',
            'honda',
            'husqvarna',
            'indian',
            'kawasaki',
            'keeway',
            'ktm',
            'kymco',
            'lambretta',
            'laverda',
            'macbor',
            'malaguti',
            'masai',
            'mondial',
            'moto guzzi',
            'moto morini',
            'mv agusta',
            'niu',
            'norton',
            'peiying',
            'peugeot',
            'piaggio',
            'riel',
            'riya',
            'royal enfield',
            'scorpa',
            'sherco',
            'sinnis',
            'suzuki',
            'sym',
            'triumph',
            'trk',
            'um',
            'ural',
            'vespa',
            'victoria',
            'voge',
            'volta',
            'vor',
            'voxan',
            'yamaha',
            'zero',
            'zinmoto',
            'autre',
          ],
        },
        {
          name: 'Caravaning',
          keywords: [
            'Caravaning',
            'camping-car',
            'caravane',
            'van aménagé',
            'mobil-home',
            'remorque',
            'véhicule de loisirs',
            'autocaravane',
            'roulotte',
            'fourgon',
            'motorhome',
          ],
        },
        {
          name: 'Utilitaires',
          keywords: [
            'Utilitaires',
            'fourgonnette',
            'camionnette',
            'pickup',
            'fourgon utilitaire',
            'camion-benne',
            'véhicule utilitaire léger',
            'fourgon frigorifique',
            'véhicule de chantier',
            'camion-grue',
            'camion-plateau',
          ],
        },
        {
          name: 'Camions',
          keywords: [
            'Camions',
            'tracteur',
            'semi-remorque',
            'camion-benne',
            'camion-citerne',
            'camion-remorque',
            'camion-porteur',
            'camion-grue',
            'camion-plateau',
            'camion frigorifique',
            'camion ampliroll',
          ],
        },
        {
          name: 'Nautisme',
          keywords: [
            'Nautisme',
            'bateau',
            'voilier',
            'yacht',
            'jet ski',
            'barque',
            'catamaran',
            'pneumatique',
            'kayak',
            'planche à voile',
            'paddle',
          ],
        },
        {
          name: 'Vélos',
          keywords: [
            'Vélos',
            'vélo de route',
            'VTT',
            'vélo électrique',
            'vélo de ville',
            'vélo pliant',
            'vélo cargo',
            'BMX',
            'vélo de course',
            'vélo tandem',
            'vélo de montagne',
          ],
        },
        {
          name: 'Équipement auto',
          keywords: [
            'Équipement auto',
            'pneu',
            'batterie',
            'huile moteur',
            'filtre à air',
            'accessoire auto',
            'outil de réparation',
            'siège auto',
            'autoradio',
            'antivol',
            'ampoule de phare',
          ],
        },
        {
          name: 'Équipement moto',
          keywords: [
            'Équipement moto',
            'casque',
            'gants',
            'blouson moto',
            'bottes',
            'pantalon moto',
            'protection dorsale',
            'antivol moto',
            'sac à dos moto',
            'intercom moto',
            'équipement pluie',
          ],
        },
        {
          name: 'Équipement caravaning',
          keywords: [
            'Équipement caravaning',
            'store',
            'auvent',
            'porte-vélo',
            'éclairage extérieur',
            'batterie auxiliaire',
            "réservoir d'eau",
            'tapis de sol',
            'barbecue',
            'réfrigérateur portable',
            'moustiquaire',
          ],
        },
        {
          name: 'Équipement nautisme',
          keywords: [
            'Équipement nautisme',
            'gilet de sauvetage',
            'bouée',
            'combinaison de plongée',
            'masque de plongée',
            'palmes',
            'ancre',
            'corde marine',
            'échelle de bain',
            'bouée tractée',
            'sondeur GPS',
          ],
        },
        {
          name: 'Équipements vélos',
          keywords: [
            'Équipements vélos',
            'casque',
            'gants',
            'vêtements cyclistes',
            'porte-bagages',
            'béquille',
            'antivol vélo',
            'pompe à vélo',
            'panier vélo',
            'remorque vélo',
            'sonnette',
          ],
        },
        {
          name: 'Services de réparations mécaniques',
          keywords: [
            'Services de réparations mécaniques',
            'garage automobile',
            'mécanicien',
            'carrosserie',
            'entretien auto',
            'réparation moteur',
            'diagnostic électronique',
            'vidange',
            'contrôle technique',
            'équilibrage des pneus',
            'révision véhicule',
          ],
        },
      ],
    }, */
  ];

  selectSubCategory(subcategory: SubCategory) {
    if (this.selectedSubCategory === subcategory) {
      this.selectedSubCategory = null;
    } else {
      this.selectedSubCategory = subcategory;
      this.selectedOption = {
        active: false,
        created_at: '',
        id: 0,
        model: null,
        name: '',
        parent_id: null,
        slug: null,
        url: null,
        route: null,
        icon_path: '',
      };
      this.fieldErrors['category'] = false;
      this.formData.category_id = this.selectedSubCategory.id!;
      this.settings = [];
      this.fetchSettings();
      this.suggestedCategory!.subcategories!.forEach((sub: SubCategory) => {
        if (sub !== subcategory) {
          sub.isChecked = false;
        }
      });
    }
  }

  onTitleChange(title: string) {
    this.fieldErrors['titre'] = false;
    //this.suggestedCategory = this.suggestCategory(title);
    if (title) {
      this.suggestedCategoryIf = true;
    } else {
      this.suggestedCategoryIf = false;
    }
    this.suggestedsubcategoryIf = false;
    if (this.suggestedCategory) {
      for (let j = 0; j < this.suggestedCategory!.subcategories!.length; j++) {
        for (let i = 0; i < this.categories.length; i++) {
          if (
            this.categories[i].name ===
            this.suggestedCategory!.subcategories![j].name
          ) {
            this.suggestedCategory!.subcategories![j].id =
              this.categories[i].id;
            this.suggestedCategory!.subcategories![j].model =
              this.categories[i].model;
            this.suggestedsubcategoryIf = true;
            //this.updateMinMaxPrix();
          } else {
          }
        }
      }
    }
    //this.saveFormDataToLocalStorage();
  }

  hasKeywords(subcategory: SubCategory): boolean {
    return (
      subcategory && subcategory.keywords && subcategory.keywords.length > 0
    );
  }

  emitNextCallbackDescriprion(): boolean {
    //this.getAds('pending');
    let isValid = true;
    if (!this.formData.titre) {
      this.fieldErrors.titre = true;
      isValid = false;
    } else {
      this.fieldErrors.titre = false;
    }

    if (!this.formData.description) {
      this.fieldErrors.description = true;
      isValid = false;
    } else {
      this.fieldErrors.description = false;
    }

    if (!isValid) {
      return false;
    }

    return true;
  }

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

  toggleOption(option: any, setting: any) {
    // Implement your toggle logic here
    // For example, toggle the selected state of the option
    option.selected = !option.selected;
    // Add any additional logic you need
  }
  parseOptionsGO(
    content: any[]
  ): { value: string; label: string; id: string }[] {
    return content.map((option) => ({
      value: option.value,
      label: option.label,
      id: option.id, // Ensure id is retrieved from your data structure
    }));
  }
  // Define inputFocused and filteredOptions properties in your component
  inputFocused: boolean = false;
  filteredOptions: {
    label: number;
    filteredContent: { id: number; name: string }[];
  }[] = [];

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

  // Adjust toggleOptionr method to close the options when clicking outside
  toggleOptionr(setting: any) {
    setting.optionsVisible = !setting.optionsVisible;
    if (!setting.optionsVisible) {
      this.inputFocused = false; // Reset inputFocused when closing options
    }
  }

  // Method to select an option and close the options
  selectOptionr(option: any, setting: any) {
    this.selectedOptionName = option.name;
    setting.selectedOption = option;
    setting.optionsVisible = false;
    this.inputFocused = false; // Reset inputFocused when an option is selected
  }

  // TrackBy functions remain the same
  trackByOptioned(index: number, item: any): any {
    return item.label;
  }

  trackByOption(index: number, item: any): any {
    return item.id;
  }

  // ParseOptions1 and ParseOptions2 functions remain the same
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

  toggledOptions(setting: Setting): void {
    this.settings.forEach((s) => {
      if (s !== setting) {
        s.optionsVisible = false;
      }
    });
    setting.optionsVisible = !setting.optionsVisible;
  }

  toggledOptionsDepend(setting: Setting): void {
    this.settings.forEach((s) => {
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
    console.log('Updated settings:', this.settings);
  }

  depend!: string | undefined;

  selectdOptiond(option: any, setting: Setting): void {
    setting.selectedOption = option;

    this.settings.forEach((s) => {
      if (setting.key === s.dependant) {
        console.log('ffff', s);
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

    console.log(
      'ggg',
      this.settings.filter(
        (content) => content.depend === true || content.depend === null
      )
    );

    // Uncomment if needed
    // this.selectedOptionName = option.name;
    this.fieldsErrors[setting.label!] = false;
    setting.optionsVisible = false;
  }

  selectdOptiondDepend(option: any, setting: Setting): void {
    setting.selectedOption = option;
    this.settings.forEach((s) => {
      if (setting.key === s.dependant) {
        console.log('ffff', s);
        this.depend = setting.selectedOption?.value;
        s.depend = true;
        s.dependValue = setting.selectedOption?.value.toString();
      }
      const val = setting.selectedOption?.value.toString();

      console.log('ggg', this.settings);
    });
    //this.selectedOptionName = option.name
    this.fieldsErrors[setting.label!] = false;
    setting.optionsVisible = false;
  }

  selectdOption(option: any) {
    this.selectedOption = option;
    this.optionsVisible = false;
  }

  // In your component class
  hasFilteredOptions(): boolean {
    return this.filteredOptions.some(
      (optioned) => optioned.filteredContent.length > 0
    );
  }

  suggestCategory(title: string): CustomCategory | null {
    for (const category of this.Customcategories) {
      const matchingSubcategories: SubCategory[] = [];
      for (const subcategory of category.subcategories || []) {
        if (this.hasKeywords(subcategory)) {
          for (const subKeyword of subcategory.keywords) {
            if (title.toLowerCase().includes(subKeyword.toLowerCase())) {
              matchingSubcategories.push(subcategory);
              break;
            }
          }
        }
      }
      if (matchingSubcategories.length > 0) {
        const matchedCategory: CustomCategory = {
          ...category,
          subcategories: matchingSubcategories,
        };
        return matchedCategory;
      }
    }
    return null;
  }
  // Load uploaded images from localStorage on page load
  loadUploadedImagesFromLocalStorage() {
    const savedImages = localStorage.getItem('uploadedImages');
    if (savedImages) {
      this.uploadedImages = JSON.parse(savedImages);
    }
  }
  // Save uploaded images to localStorage
  saveUploadedImagesToLocalStorage() {
    localStorage.setItem('uploadedImages', JSON.stringify(this.uploadedImages));
  }

  ngOnInit(): void {
    this.getUserInfo();
    this.fetchCategories();
    //this.loadFormDataFromLocalStorage();
    //this.loadUploadedImagesFromLocalStorage();
    const userId = localStorage.getItem('loggedInUserId');
    const accessToken = localStorage.getItem('loggedInUserToken');
    this.annonceService.getAds().subscribe((data) => {
      const adIds = data.data.map((ad: any) => ad.id);
      const adPromises = adIds.map((adId: any) => {
        return this.annonceService.getAdById(adId).toPromise();
      });
      Promise.all(adPromises)
        .then((adsData) => {
          this.ads = adsData
            .filter((ad: any) => ad.data.user_id === Number(userId))
            .map((ad: any) => {
              const createdAt =
                ad.data.medias && ad.data.medias.length > 0
                  ? ad.data.medias[0].created_at
                  : ad.data.created_at;
              ad.data.created_at = this.extractDate(createdAt);
              return ad.data;
            });
        })
        .catch((error) => {});
    });
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

    this.loadPaidOptions();
    this.loadPromoteOptions();
  }
  get locale() {
    return this.primengConfig.translation;
  }

  formatDates(event: any) {
    console.log('rrrrrrrrr', event);
  }

  formatDatess(event: any) {
    console.log('tttrrrrrrrrr', event);
  }

  extractDate(dateTimeString: string): string {
    const date = new Date(dateTimeString);
    if (isNaN(date.getTime())) {
      return '';
    } else {
      return date.toISOString().split('T')[0];
    }
  }

  resetFormData(): void {
    this.formData = {
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
      category_parent_id: 0,
    };
  }

  getUserInfo(): void {
    if (typeof localStorage !== 'undefined') {
      const userId = localStorage.getItem('loggedInUserId');
      const accessToken = localStorage.getItem('loggedInUserToken');
      if (userId && accessToken) {
        this.userService
          .getUserInfoById(Number(userId), accessToken)
          .subscribe((userInfo) => {
            this.userInfo = userId;
            this.loggedInUserName = `${userInfo.data.first_name} ${userInfo.data.last_name}`;
          });
      }
    }
  }

  fetchCategories(): void {
    const accessToken = localStorage.getItem('loggedInUserToken');
    if (!accessToken) {
      return;
    }
    const queryParams = {
      parent: 1,
    };
    this.categoryService
      .getCategories(queryParams)
      .subscribe((categorieParent) => {
        this.categoriesParent = categorieParent.data;
      });
    console.log('categories categories', this.categories);
  }

  uploadFiles() {
    const accessToken = localStorage.getItem('loggedInUserToken');
    if (!accessToken) {
      return;
    }
    this.selectedFiles.forEach((file) => {
      this.annonceService
        .uploadImage(file, accessToken)
        .then((response) => {})
        .catch((error) => {
          console.error('Error uploading file:', error);
        });
    });
    this.selectedFiles = [];
  }
  fileError: string = '';
  onFileSelected(event: any): void {
    const maxImagesAllowed = 3;
    const allowedFileTypes = ['image/jpeg', 'image/png'];
    const files: FileList = event.target.files;
    this.fileError = '';

    if (files && files.length > 0) {
      if (this.uploadedImages.length + files.length > maxImagesAllowed) {
        this.maxImages = true;
        return;
      }

      for (let i = 0; i < files.length; i++) {
        const file: File = files[i];
        if (!allowedFileTypes.includes(file.type)) {
          this.fileError = 'Seuls les formats JPG et PNG sont acceptés.';
          return;
        }

        const reader: FileReader = new FileReader();
        this.selectedFiles.push(file);
        reader.onload = (e) => {
          const imageDataURL: string = e.target!.result as string;
          this.uploadedImages.push(imageDataURL);
        };
        reader.readAsDataURL(file);
      }
    }
    //this.saveUploadedImagesToLocalStorage();
    console.log('Images téléchargées', this.uploadedImages);
  }

  count: number = 0;

  deleteImage(index: number) {
    if (index > -1 && index < this.uploadedImages.length) {
      const deletedImage = this.uploadedImages.splice(index, 1)[0];
      this.selectedFiles.splice(index - this.count, 1)[0];
      if (!this.deletedImages.includes(deletedImage)) {
        this.deletedImages.push(deletedImage);
      }
    }
    if (this.uploadedImages.length == 3) {
      this.maxImages = true;
      return;
    } else {
      this.maxImages = false;
      return;
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

  reUploadDeleted(index: number) {
    if (index > -1 && index < this.deletedImages.length) {
      const imageDataURL = this.deletedImages.splice(index, 1)[0];
      this.uploadedImages.push(imageDataURL);
    }
  }

  isPhone(): boolean {
    const screenWidth = window.innerWidth;
    if (screenWidth <= 768) {
      return true;
    } else {
      return false;
    }
  }

  isLinear(): boolean {
    return !this.isPhone();
  }

  emitNextCallbackSetting(): boolean {
    this.fieldsErrors = {};
    console.log('great ', this.settings, this.date);
    const settingADS: { [key: string]: any } = {};
    this.settings = this.settings.filter(
      (content) => content.depend === true || content.depend === null
    );
    for (let i = 0; i < this.settings.length; i++) {
      const setting = this.settings[i];
      if (
        setting.type === 'text' ||
        setting.type === 'number' ||
        setting.type === 'bool' ||
        setting.type === 'select' ||
        setting.type === 'options' ||
        setting.type === 'int'
      ) {
        if (setting.selectedOption) {
          settingADS[setting.key] = setting.selectedOption.value;
        } else {
          settingADS[setting.key] = setting.content;
        }
      } else if (setting.type === 'table') {
        settingADS[setting.key] = setting.selectedOption?.id;
      } else if (setting.type === 'multiple') {
        const list: any[] = [];
        setting.selectedOptions.forEach((element) => {
          list.push(element.value);
        });
        console.log('listtttttttttteee', list);
        settingADS[setting.key] = list;
      } else if (setting.type === 'date') {
        const date = new Date(this.date);
        setting.content = this.formatDate(date);
        settingADS[setting.key] = setting.content;
      }
    }
    console.log('settingADSoooo', settingADS);
    this.settings.forEach((setting) => {
      if (
        setting.type == 'text' ||
        setting.type == 'number' ||
        setting.type == 'date' ||
        setting.type == 'bool' ||
        setting.type === 'int'
      ) {
        if (setting.content === null) {
          console.log('great ', setting);

          this.fieldsErrors[setting.label!] = true;
        }
      } else if (setting.type == 'select') {
        if (!setting.selectedOption) {
          this.fieldsErrors[setting.label!] = true;
        }
      } else if (setting.type == 'multiple') {
        if (!setting.selectedOptions) {
          this.fieldsErrors[setting.label!] = true;
        }
      }
    });
    const hasErrors = Object.keys(this.fieldsErrors).length > 0;
    if (hasErrors) {
      const settingADS: { [key: string]: any } = {};
      for (let i = 0; i < this.settings.length; i++) {
        const setting = this.settings[i];
        if (
          setting.type === 'text' ||
          setting.type === 'number' ||
          setting.type === 'date' ||
          setting.type === 'bool' ||
          setting.type === 'select' ||
          setting.type === 'options' ||
          setting.type === 'int'
        ) {
          if (setting.selectedOption) {
            settingADS[setting.key] = setting.selectedOption.value;
          } else {
            settingADS[setting.key] = setting.content;
          }
        } else if (setting.type === 'table') {
          settingADS[setting.key] = setting.selectedOption?.id;
        } else if (setting.type === 'multiple') {
          const list: any[] = [];
          setting.selectedOptions.forEach((element) => {
            list.push(element.value);
          });
          console.log('listtttttttttteee', list);
          settingADS[setting.key] = list;
        }
      }
      console.log('settingADS', settingADS);

      return false;
    }
    return true;
  }
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2); // Months are zero-based
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  onDateInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.date = input.value;
  }
  emitNextCallbackTitre(): boolean {
    //this.getAds('pending');
    let isValid = true;

    if (!this.formData.titre) {
      this.fieldErrors.titre = true;
      isValid = false;
    } else {
      this.fieldErrors.titre = false;
    }

    if (!this.formData.category_id) {
      this.fieldErrors.category = true;
      return false;
    }

    if (!isValid) {
      return false;
    }
    return true;
  }

  emitNextCallbackPrix(): boolean {
    //this.getAds('pending');
    let isValid = true;

    if (!this.formData.ville) {
      this.fieldErrors.ville = true;
      isValid = false;
    } else {
      this.fieldErrors.ville = false;
    }

    if (!this.formData.code_postal) {
      this.fieldErrors.code_postal = true;
      isValid = false;
    } else {
      this.fieldErrors.code_postal = false;
    }

    if (!this.formData.prix) {
      this.fieldErrors.prix = true;
      isValid = false;
    } else {
      this.fieldErrors.prix = false;
    }

    if (!isValid) {
      return false;
    }
    return true;
  }

  openselect = false;
  selectOption(category: Category): void {
    this.filteredSubcategories = [];
    this.formData.category_id = 0;
    this.selectedOption = category;
    if (this.selectedOption) {
      this.categoryService.getCategories({ active: 1 }).subscribe((data) => {
        this.filteredSubcategories = data.data.filter(
          (parent: { parent_id: number }) => parent.parent_id == category.id
        );
      });
      // Assuming allCategories is an array of objects and category.id is the parent_id you want to filter by
      /*       this.categoryService.getCategories({active:1}).subscribe((all) => {
        all.data.forEach((element: { id: string; }) => {
                  this.categoryService.getCategoryById(element.id).subscribe((data)=>{
                    if(data.data.parent_id==category.id){
                      this.filteredSubcategories.push(data.data);
                    }

                  })
        });
      }); */

      this.selectedSubcategory = null; // Reset subcategory when parent changes
      this.openselect = true;
      this.subcategoryOptionsVisible = false;
    } else {
      if (this.selectedSubCategory!.id) {
        this.formData.category_id = this.selectedSubCategory!.id;
      }
    }
    this.fieldErrors.category = false;
    this.optionsVisible = false;
    this.selectedState = null;
    this.selectedSubCategory = null;
    this.genreOptionsVisible = false;
  }
  marquesPopulaires: Array<{ id: number; name: string }> = [];
  autresMarques: Array<{ id: number; name: string }> = [];

  transformData(data: any): Array<{ id: number; name: string }> {
    return Object.entries(data).map(([key, value]) => ({
      id: +key,
      name: value as string,
    }));
  }
  filteredSubcategories: any[] = [];
  selectedSubcategory: any = null;
  subcategoryOptionsVisible: boolean = false;

  selectSubcategory(subcategory: any) {
    this.subcategoryOptionsVisible = false;

    this.selectedSubcategory = subcategory;
    this.categoryService.getCategoryById(subcategory.id).subscribe((data) => {
      this.selectedSubcategory = data.data;
      this.settings = [];
      this.boolSettings = [];

      this.fetchSettings();
      console.log('this.settings', this.settings, this.boolSettings);
    });

    this.formData.category_id = subcategory.id;
  }

  // In your component class
  onOptionChange(event: any, option: any): void {
    if (option.bool) {
      if (!Array.isArray(this.selectedOptions)) {
        this.selectedOptions = [];
      }
      // Add the option if it's not already in the selectedOptions array
      if (!this.selectedOptions.some((opt) => opt.id === option.id)) {
        this.selectedOptions.push(option);
      }

      this.fieldErrors['options'] = false;
    } else {
      // Remove the option if option.bool is false
      this.selectedOptions = this.selectedOptions.filter(
        (opt) => opt.id !== option.id
      );

      this.fieldErrors['options'] = true;
    }
    this.updateButtonLabel();
    this.calculateTotalPrice(); // Recalculate price on option change
  }
  paidOptions: any[] = [];
  promoteOptions: any[] = [];
  selectedOptions: any[] = [];
  selectedPaidOptionId: any = null; // Initialize to null
  totalPrice: number = 0; // Variable to store the total price
  selectedPaidOption: any = null; // Initialize to null
  buttonLabel: string = 'Suivant';

  updateButtonLabel() {
    if (this.selectedPaidOptionId === 0 && this.selectedOptions.length === 0) {
      this.buttonLabel = 'Confirmer';
    } else {
      this.buttonLabel = 'Suivant';
    }
  }
  // Method to fetch paid options
  loadPaidOptions(): void {
    const accessToken = localStorage.getItem('loggedInUserToken');

    this.optionsService.getPaidOptions(accessToken!, 'go-up').subscribe(
      (response) => {
        if (response.status === 'Success') {
          this.paidOptions = response.data;
          this.paidOptions.forEach((option) => {
            option.bool = false;
            // Set the option as selected if it matches selectedPaidOptionId
            if (option.id === this.selectedPaidOptionId) {
              option.bool = true;
            }
          });
          this.calculateTotalPrice(); // Recalculate price when options are loaded
        } else {
          console.error('Failed to load paid options:', response.message);
        }
      },
      (error) => {
        console.error('Error fetching paid options:', error);
      }
    );
  }

  // Method to fetch promote options
  loadPromoteOptions(): void {
    const accessToken = localStorage.getItem('loggedInUserToken');

    this.optionsService.getPaidOptions(accessToken!, 'promote').subscribe(
      (response) => {
        if (response.status === 'Success') {
          this.promoteOptions = response.data;
          this.promoteOptions.forEach((option) => {
            option.bool = false;
          });
        } else {
          console.error('Failed to load promote options:', response.message);
        }
      },
      (error) => {
        console.error('Error fetching promote options:', error);
      }
    );
  }

  // Method to handle paid option change
  onPaidOptionChange(optionId: number | null, option?: any): void {
    this.selectedPaidOptionId = optionId; // Update selectedPaidOptionId
    this.selectedPaidOption = option;
    console.log('Selected paid option ID:', this.selectedPaidOptionId);

    this.calculateTotalPrice(); // Recalculate price on paid option change
    this.updateButtonLabel();
    this.fieldErrors['options'] = false;
  }

  // Method to calculate total price
  // Method to calculate total price
  calculateTotalPrice(): void {
    let paidOptionPrice = this.selectedPaidOption
      ? this.selectedPaidOption.price
      : 0;
    let optionsPrice = this.selectedOptions.reduce(
      (total, option) => total + option.price,
      0
    );

    this.totalPrice = Number(paidOptionPrice) + Number(optionsPrice);
  }

  // Add this method to your component
  isValidNumber(value: any): boolean {
    return !isNaN(value) && typeof value === 'number';
  }

  // Call this method when you need to emit data
  emitNextCallbackOptions(): boolean {
    this.calculateTotalPrice();

    console.log('Selected paid option ID:', this.selectedPaidOptionId);
    console.log('Selected promote option IDs:', this.selectedOptions);
    console.log('Total Price:', this.totalPrice);

    if (
      this.selectedPaidOptionId === null &&
      this.selectedOptions.length == 0
    ) {
      this.fieldErrors['options'] = true;
      return false;
    } else {
      this.fieldErrors['options'] = false;
      return true;
    }
    // You can add additional logic here to handle the collected data
  }

  toggleSubcategoryOptions() {
    this.subcategoryOptionsVisible = !this.subcategoryOptionsVisible;
    this.optionsVisible = false;
    this.fieldErrors['category'] = false;
  }

  boolSettings: any[] = [];

  fetchSettings(): void {
    const accessToken = localStorage.getItem('loggedInUserToken');
    const queryParams = { model: this.selectedSubcategory.model };
    const modelFields = this.selectedSubcategory.model_fields;

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
      }
    });

    // Add bool settings last to ensure correct order
    this.boolSettings.forEach((setting) => this.addSettingInOrder(setting));

    console.log('this.settings', this.settings, this.boolSettings);
  }

  addSettingInOrder(newSetting: any): void {
    // Find the correct position based on order
    const index = this.settings.findIndex((s) => s.order > newSetting.order);
    if (index === -1) {
      this.settings.push(newSetting); // Append if no larger order is found
    } else {
      this.settings.splice(index, 0, newSetting); // Insert at the correct position
    }
  }

  // Inside your component class
  toggleOptionsGO(setting: any) {
    setting.optionsVisible = !setting.optionsVisible;
  }
  updateSetting(setting: any, value: boolean) {
    setting.content = value;
    // Any additional logic to handle the updated setting
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
  // Add this method to your component class

  // Modify this method in your component class
  handleButtonClick(nextCallback: Function) {
    if (this.buttonLabel === 'Confirmer') {
      this.onSubmit();
    } else {
      this.emitNextCallbackOptions();
      nextCallback(); // Call nextCallback to proceed to the next step
    }
  }

  payment(): void {
    console.log('responsee meeeeeeeee');
    let isValid = true;
    if (!this.formData.ville) {
      this.fieldErrors.ville = true;
      isValid = false;
    } else {
      this.fieldErrors.ville = false;
    }

    if (!this.formData.code_postal) {
      this.fieldErrors.code_postal = true;
      isValid = false;
    } else {
      this.fieldErrors.code_postal = false;
    }

    if (!this.formData.prix) {
      this.fieldErrors.prix = true;
      isValid = false;
    } else {
      this.fieldErrors.prix = false;
    }

    if (!this.termsAccepted) {
      this.fieldErrors.termsAccepted = true;
      isValid = false;
    } else {
      this.fieldErrors.termsAccepted = false;
    }

    if (!isValid) {
      return;
    }

    const accessToken = localStorage.getItem('loggedInUserToken');
    const userId = localStorage.getItem('loggedInUserId');

    const mediaIds: string[] = [];
    Promise.all(
      this.selectedFiles.map((file) => {
        console.log('console', accessToken);
        return this.annonceService
          .uploadImage(file, accessToken!)
          .then((response) => {
            console.log('responsee', response);
            mediaIds.push(response.data.id);
          })
          .catch((error) => {
            throw error;
          });
      })
    ).then(() => {
      const annonceData = {
        user_id: userId,
        category_id: this.selectedSubcategory.id,
        title: this.formData.titre,
        description: this.formData.description,
        state: this.formData.state,
        urgent: this.formData.urgent,
        highlighted: this.formData.highlighted,
        price: parseFloat(this.formData.prix),
        city: this.formData.ville,
        postal_code: this.formData.code_postal,
        medias: {
          _ids: mediaIds,
        },
        validation_status: 'pending',
      };
      console.log('mediiiiEEEEEEEEEEEEE', this.selectedFiles);

      this.annonceService.createAnnonce(annonceData, accessToken!).subscribe(
        (response) => {
          const addressTabLink = document.querySelector(
            '#orders-tab'
          ) as HTMLAnchorElement;
          if (addressTabLink) {
            addressTabLink.click();
          }
          const settingADS: { [key: string]: any } = {};
          for (let i = 0; i < this.settings.length; i++) {
            const setting = this.settings[i];
            if (
              setting.type === 'text' ||
              setting.type === 'number' ||
              setting.type === 'select' ||
              setting.type === 'options' ||
              setting.type === 'int'
            ) {
              if (setting.selectedOption) {
                settingADS[setting.key] = setting.selectedOption.value;
              } else {
                settingADS[setting.key] = setting.content;
              }
            } else if (setting.type === 'table') {
              settingADS[setting.key] = setting.selectedOption?.id;
            } else if (setting.type === 'bool') {
              settingADS[setting.key] =
                setting.selectedOption?.value === 'true' ? 1 : 0;
            } else if (setting.type === 'multiple') {
              const list: any[] = [];
              setting.selectedOptions.forEach((element) => {
                list.push(element.value);
              });
              console.log('listtttttttttteee', list);
              settingADS[setting.key] = list;
            } else if (setting.type === 'date') {
              const date = new Date(this.date);
              setting.content = this.formatDate(date);
              settingADS[setting.key] = setting.content;
            }
          }
          console.log('settingADS', settingADS);

          const adId = response.data.id;

          // Post order
          this.optionsService
            .postOrder(accessToken!, Number(userId), adId)
            .subscribe(
              (orderResponse) => {
                const orderId = orderResponse.data.id;
                // Post order items for selected paid option
                const paidOptionId = this.selectedPaidOptionId;
                const orderItemsObservables = [];

                if (paidOptionId) {
                  orderItemsObservables.push(
                    this.optionsService
                      .postOrderItem(accessToken!, orderId, paidOptionId)
                      .subscribe((response) =>
                        console.log(
                          'postOrderItem cretaed ',
                          paidOptionId,
                          response
                        )
                      )
                  );
                }
                console.log('orderId', orderId, paidOptionId);

                // Add selectedOptions IDs to order items
                this.selectedOptions.forEach((option) => {
                  if (option.id) {
                    orderItemsObservables.push(
                      this.optionsService
                        .postOrderItem(accessToken!, orderId, option.id)
                        .subscribe((response) =>
                          console.log(
                            'postOrderItem cretaed ',
                            option.id,
                            response
                          )
                        )
                    );
                  }
                  console.log('orderIdrrr', orderId, option);
                });

                // Wait for all order items requests to complete
                Promise.all(orderItemsObservables)
                  .then(() => {
                    console.log('All order items created successfully.');
                    this.userService
                      .getUserInfoById(Number(userId), accessToken!)
                      .subscribe(
                        (userResponse: any) => {
                          const user = userResponse.data;
                          const paymentData = {
                            order_id: orderId,
                            user_id: userId,
                            email: user.email,
                            full_name: `${user.first_name} ${user.last_name}`,
                            provider: 'cmi',
                            amount: this.totalPrice,
                          };
                          console.log('Payment paymentData:', paymentData);
                          // Post payment
                          this.optionsService
                            .postPayment(paymentData, accessToken!)
                            .subscribe(
                              (paymentResponse) => {
                                console.log(
                                  'Payment response:',
                                  paymentResponse
                                );
                                const { url, postParams } =
                                  paymentResponse.data;

                                // Redirect with POST data
                                this.saveToLocalStorage(url, postParams);

                                // Call the redirect after saving
                                this.redirectToPayment();
                                //this.redirectToPaymentUrl(url, postParams);
                                // Handle success, e.g., navigate to a confirmation page
                              },
                              (error) => {
                                console.error(
                                  'Error processing payment:',
                                  error
                                );
                              }
                            );
                        },
                        (error) => {
                          console.error('Error fetching user details:', error);
                        }
                      );
                  })
                  .catch((error) => {
                    console.error('Error creating order items:', error);
                  });
              },
              (error) => {
                console.error('Error creating order:', error);
              }
            );
          this.annonceService
            .insertSetting(
              response.data.id,
              'ad-models',
              settingADS,
              accessToken!
            )

            .subscribe(
              (response) => {
                // this.resetFormData();
                // window.location.href = '/annonce_in_progress';
                /*                 this.selectedOption = {
                  active: false,
                  created_at: '',
                  id: 0,
                  model: null,
                  name: '',
                  parent_id: null,
                  slug: null,
                  url: null,
                  route: null,
                  icon_path: '',
                }; */
                console.log('Annonce créée avec succès !', response);
              },
              (error) => {
                console.error(
                  'Error inserting state and genre:',
                  error,
                  settingADS
                );
              }
            );
        },
        (error) => {
          console.error("Erreur lors de la création de l'annonce :", error);
        }
      );
      this.selectedFiles = [];
    });
  }

  secretKey: string = 'your-secret-key'; // Use a secret key for encryption/decryption

  // Method to encrypt data
  encryptData(data: any): string {
    return CryptoJS.AES.encrypt(
      JSON.stringify(data),
      this.secretKey
    ).toString();
  }

  // Method to decrypt data
  decryptData(encryptedData: string): any {
    const bytes = CryptoJS.AES.decrypt(encryptedData, this.secretKey);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  }

  // Save the encrypted data to localStorage
  saveToLocalStorage(url: string, postParams: any): void {
    const dataToSave = { url, postParams };
    const encryptedData = this.encryptData(dataToSave);
    localStorage.setItem('paymentData', encryptedData);
  }

  // Retrieve and decrypt the data from localStorage
  getFromLocalStorage(): { url: string; postParams: any } | null {
    const encryptedData = localStorage.getItem('paymentData');
    if (encryptedData) {
      return this.decryptData(encryptedData);
    }
    return null;
  }

  // Redirect method
  redirectToPayment(): void {
    const savedData = this.getFromLocalStorage();
    if (savedData) {
      this.redirectToPaymentUrl(savedData.url, savedData.postParams);
    } else {
      console.error('No payment data found in localStorage');
    }
  }

  // Method to redirect with POST
  redirectToPaymentUrl(url: string, postParams: any): void {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = url;

    for (const key in postParams) {
      if (postParams.hasOwnProperty(key)) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = postParams[key];
        form.appendChild(input);
      }
    }

    document.body.appendChild(form);
    form.submit();
  }
  onSubmit(): void {
    console.log('responsee meeeeeeeee');
    let isValid = true;
    if (!this.formData.ville) {
      this.fieldErrors.ville = true;
      isValid = false;
    } else {
      this.fieldErrors.ville = false;
    }

    if (!this.formData.code_postal) {
      this.fieldErrors.code_postal = true;
      isValid = false;
    } else {
      this.fieldErrors.code_postal = false;
    }

    if (!this.formData.prix) {
      this.fieldErrors.prix = true;
      isValid = false;
    } else {
      this.fieldErrors.prix = false;
    }

    if (!isValid) {
      return;
    }

    const accessToken = localStorage.getItem('loggedInUserToken');
    const userId = localStorage.getItem('loggedInUserId');
    if (!accessToken) {
      return;
    }

    const mediaIds: string[] = [];
    Promise.all(
      this.selectedFiles.map((file) => {
        console.log('console', accessToken);
        return this.annonceService
          .uploadImage(file, accessToken)
          .then((response) => {
            console.log('responsee', response);
            mediaIds.push(response.data.id);
          })
          .catch((error) => {
            throw error;
          });
      })
    ).then(() => {
      const annonceData = {
        user_id: userId,
        category_id: this.selectedSubcategory.id,
        title: this.formData.titre,
        description: this.formData.description,
        state: this.formData.state,
        urgent: this.formData.urgent,
        highlighted: this.formData.highlighted,
        price: parseFloat(this.formData.prix),
        city: this.formData.ville,
        postal_code: this.formData.code_postal,
        medias: {
          _ids: mediaIds,
        },
        validation_status: 'pending',
      };
      console.log('mediiiiEEEEEEEEEEEEE', this.selectedFiles);

      this.annonceService.createAnnonce(annonceData, accessToken!).subscribe(
        (response) => {
          const addressTabLink = document.querySelector(
            '#orders-tab'
          ) as HTMLAnchorElement;
          if (addressTabLink) {
            addressTabLink.click();
          }
          const settingADS: { [key: string]: any } = {};
          for (let i = 0; i < this.settings.length; i++) {
            const setting = this.settings[i];
            if (
              setting.type === 'text' ||
              setting.type === 'number' ||
              setting.type === 'select' ||
              setting.type === 'options' ||
              setting.type === 'int'
            ) {
              if (setting.selectedOption) {
                settingADS[setting.key] = setting.selectedOption.value;
              } else {
                settingADS[setting.key] = setting.content;
              }
            } else if (setting.type === 'table') {
              settingADS[setting.key] = setting.selectedOption?.id;
            } else if (setting.type === 'bool') {
              settingADS[setting.key] =
                setting.selectedOption?.value === 'true' ? 1 : 0;
            } else if (setting.type === 'multiple') {
              const list: any[] = [];
              setting.selectedOptions.forEach((element) => {
                list.push(element.value);
              });
              console.log('listtttttttttteee', list);
              settingADS[setting.key] = list;
            } else if (setting.type === 'date') {
              const date = new Date(this.date);
              setting.content = this.formatDate(date);
              settingADS[setting.key] = setting.content;
            }
          }
          console.log('settingADS', settingADS);

          this.annonceService
            .insertSetting(
              response.data.id,
              'ad-models',
              settingADS,
              accessToken
            )

            .subscribe(
              (response) => {
                this.resetFormData();
                window.location.href = '/annonce_in_progress';
                this.selectedOption = {
                  active: false,
                  created_at: '',
                  id: 0,
                  model: null,
                  name: '',
                  parent_id: null,
                  slug: null,
                  url: null,
                  route: null,
                  icon_path: '',
                };
                console.log('Annonce créée avec succès !', response);
              },
              (error) => {
                console.error(
                  'Error inserting state and genre:',
                  error,
                  settingADS
                );
              }
            );
        },
        (error) => {
          console.error("Erreur lors de la création de l'annonce :", error);
        }
      );
      this.selectedFiles = [];
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const targetElement = event.target as HTMLElement;
    const isCategoryOpen = !!targetElement.closest('.select-btn');
    const isStateOpen = !!targetElement.closest('.select-menu .select-btn');

    if (!isCategoryOpen && !isStateOpen) {
      this.optionsVisible = false;
      this.stateOptionsVisible = false;
      this.genreOptionsVisible = false;
      this.subcategoryOptionsVisible = false;
    }
    if (!this.isDescendant(targetElement, 'select-menu')) {
      // Close all select menus
      this.settings.forEach((setting) => {
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

  showDialog(ad: any) {
    this.selectedAd = ad;
    this.adDialog = true;
  }

  hideDialogs() {
    this.adDialog = false;
  }

  toggleOptions(): void {
    this.optionsVisible = !this.optionsVisible;
    this.fieldErrors['category'] = false;
    this.stateOptionsVisible = false;
    this.genreOptionsVisible = false;
    this.subcategoryOptionsVisible = false;
  }

  toggleUrgent(checked: boolean) {
    this.formData.urgent = checked;
  }

  toggleHighlighted(checked: boolean) {
    this.formData.highlighted = checked;
  }

  logout(): void {
    this.authService.logout();
  }
  handleNextClick(): void {
    if (this.buttonLabel === 'Confirmer') {
      this.onSubmit();
    } else {
      const shouldEmitNext = this.emitNextCallbackOptions();
      if (shouldEmitNext!) {
        this.nextCallback?.emit();
      }
    }
  }

  fieldErrors: {
    [key: string]: boolean;
    titre: boolean;
    description: boolean;
    prix: boolean;
    state: boolean;
    genre: boolean;
    category: boolean;
    ville: boolean;
    code_postal: boolean;
    options: boolean;
    termsAccepted: boolean;
  } = {
    titre: false,
    description: false,
    prix: false,
    state: false,
    genre: false,
    category: false,
    ville: false,
    code_postal: false,
    options: false,
    termsAccepted: false,
  };
  termsAccepted = false;
  clearError(fieldName: string): void {
    this.fieldErrors[fieldName] = false;
  }

  emitNextCallback(): boolean {
    let isValid = true;

    if (!this.formData.titre) {
      this.fieldErrors.titre = true;
      isValid = false;
    } else {
      this.fieldErrors.titre = false;
    }
    if (!this.formData.description) {
      this.fieldErrors.description = true;
      isValid = false;
    } else {
      this.fieldErrors.description = false;
    }
    if (!this.formData.prix) {
      this.fieldErrors.prix = true;
      isValid = false;
    } else {
      this.fieldErrors.prix = false;
    }
    if (!this.formData.state) {
      this.fieldErrors.state = true;
      isValid = false;
    } else {
      this.fieldErrors.state = false;
    }
    if (!this.formData.genre) {
      this.fieldErrors.genre = true;
      isValid = false;
    } else {
      this.fieldErrors.genre = false;
    }
    if (!this.formData.category_id) {
      this.fieldErrors.category = true;
      return false;
    }

    if (!isValid) {
      return false;
    }

    return true;
  }

  dataURItoBlob(dataURI: string): Blob {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  }

  onSaveImagesToDatabase(): void {
    this.uploadFiles();
  }

  // getAds('pending'): void {
  //   const accessToken = localStorage.getItem('loggedInUserToken');
  //   this.annonceService.getAds(accessToken!).subscribe((ads: any[]) => {
  //     this.adds = ads;
  //     this.updateMinMaxPrix();
  //   });
  // }

  // updateMinMaxPrix(): void {
  //   this.filteredAds = this.annonceService.filterAdsByTitle(
  //     this.adds,
  //     this.formData.titre
  //   );
  //   console.log('filteredAds', this.filteredAds);
  //   this.minPrix = Math.min(...this.filteredAds.map((ad) => ad.price));
  //   this.maxPrix = Math.max(...this.filteredAds.map((ad) => ad.price));
  //   console.log('minPrix', this.minPrix);
  //   console.log('maxPrix', this.maxPrix);
  // }
}
