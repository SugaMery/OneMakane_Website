import { Component, EventEmitter, HostListener, Output } from '@angular/core';
import { AuthGuard } from '../auth.guard';
import { UserService } from '../user.service';
import { CategoryService } from '../category.service';
import { AnnonceService } from '../annonce.service';
import { SettingService } from '../setting.service';
import { Router } from '@angular/router';
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
  selector: 'app-add-ads',
  templateUrl: './add-ads.component.html',
  styleUrl: './add-ads.component.css',
})
export class AddAdsComponent {
  userInfo: any;
  loggedInUserName: string | undefined;
  deletedImages: string[] = [];
  uploadedImages: string[] = [];
  selectedSubCategory: SubCategory | null = null;
  categories: Category[] = [];
  formDataCustom: any = {};
  suggestedCategory!: CustomCategory | null;
  fieldsErrors: { [settingLabel: string]: boolean } = {};
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

  constructor(
    private authService: AuthGuard,
    private annonceService: AnnonceService,
    private userService: UserService,
    private categoryService: CategoryService,
    private settingsService: SettingService,
    private router: Router
  ) {}

  // Liste de catégories avec leurs mots-clés associés
  Customcategories: CustomCategory[] = [
    {
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
    },
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
    this.suggestedCategory = this.suggestCategory(title);
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
  }

  hasKeywords(subcategory: SubCategory): boolean {
    return (
      subcategory && subcategory.keywords && subcategory.keywords.length > 0
    );
  }

  emitNextCallbackDescriprion(): boolean {
    //this.getAds();
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

  toggledOptions(setting: Setting): void {
    this.settings.forEach((s) => {
      if (s !== setting) {
        s.optionsVisible = false;
      }
    });
    setting.optionsVisible = !setting.optionsVisible;
  }

  selectdOptiond(option: any, setting: Setting): void {
    setting.selectedOption = option;
    this.fieldsErrors[setting.label!] = false;
    setting.optionsVisible = false;
  }

  selectdOption(option: any) {
    this.selectedOption = option;
    this.optionsVisible = false;
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

  ngOnInit(): void {
    this.getUserInfo();
    this.fetchCategories();

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
    this.categoryService.getCategoriesFrom().subscribe(
      (categories) => {
        this.categories = categories.data.filter(
          (category: Category) =>
            category.active === true && category.parent_id !== null
        );
        for (let i = 0; i < this.categories.length; i++) {
          const parentId = this.categories[i].parent_id?.toString();
          const Id = this.categories[i].id?.toString();
          if (!parentId) {
            continue;
          }
          this.categoryService
            .getCategoryById(parentId)
            .subscribe(
              (parent) => (this.categories[i].parentCategoy = parent.data)
            );
          this.categoryService
            .getCategoryById(Id)
            .subscribe(
              (parent) =>
                (this.categories[i].model_fields = parent.data!.model_fields)
            );
        }
        console.log('categories categories 555', this.categories);
      },
      (error) => {
        console.error('Error fetching categories: ', error);
      }
    );
    console.log('categories categories', this.categories);
  }

  uploadFiles() {
    const accessToken = localStorage.getItem('loggedInUserToken');
    if (!accessToken) {
      return;
    }
    this.selectedFiles.forEach((file) => {
      this.annonceService
        .uploadFile(file, accessToken)
        .then((response) => {})
        .catch((error) => {
          console.error('Error uploading file:', error);
        });
    });
    this.selectedFiles = [];
  }

  onFileSelected(event: any) {
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

  deleteImage(index: number) {
    if (index > -1 && index < this.uploadedImages.length) {
      const deletedImage = this.uploadedImages.splice(index, 1)[0];
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
    this.settings.forEach((setting) => {
      if (!setting.selectedOption) {
        this.fieldsErrors[setting.label!] = true;
      }
    });
    const hasErrors = Object.keys(this.fieldsErrors).length > 0;
    if (hasErrors) {
      return false;
    }
    return true;
  }

  emitNextCallbackTitre(): boolean {
    //this.getAds();
    let isValid = true;
    if (this.settings.length === 0) {
      this.fetchSettings();
    }

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

  selectOption(category: Category): void {
    this.selectedOption = category;
    if (this.selectedOption) {
      this.formData.category_id = category.id;
      this.settings = [];
      this.fetchSettings();
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

  onSubmit(): void {
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
        return this.annonceService
          .uploadFile(file, accessToken)
          .then((response) => {
            mediaIds.push(response.data.id);
          })
          .catch((error) => {
            throw error;
          });
      })
    ).then(() => {
      const annonceData = {
        user_id: userId,
        category_id: this.selectedOption.id,
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
      console.log("mediiiiEEEEEEEEEEEEE",this.selectedFiles);

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
            if (setting.selectedOption) {
              settingADS[setting.name] = setting.selectedOption.value;
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
                this.router.navigate(['/login']); // Replace 'login' with your actual login route
              },
              (error) => {
                console.error('Error inserting state and genre:', error);
              }
            );

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
  } = {
    titre: false,
    description: false,
    prix: false,
    state: false,
    genre: false,
    category: false,
    ville: false,
    code_postal: false,
  };

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

  // getAds(): void {
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
