import {
  Component,
  HostListener,
  Inject,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AnnonceService } from '../annonce.service';
import { CategoryService } from '../category.service';
import { SettingService } from '../setting.service';
import { Observable } from 'rxjs/internal/Observable';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

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
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adService: AnnonceService,
    private categoryService: CategoryService,
    private annonceService: AnnonceService,
    private settingsService: SettingService,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object
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
    this.initializeAd();
    this.subscribeToRouteParams();
    this.categories.forEach((categorie) => {
      if (this.ad.category.id == categorie.id) {
        console.log('greeeeeeeeeeeeeeeeeetttttttt');
        this.selectedOption = categorie;
      }
    });
    this.fetchCategories();
    this.fetchSettings();
    console.log('settingsss', this.settings);
  }

  initializeAd(): void {
    const adId = this.route.snapshot.paramMap.get('id');
    if (adId) {
      this.adService.getAdById(adId).subscribe((data) => {
        this.ad = data.data;
        this.uploadedImages = this.ad.medias;
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

  fetchCategoryAndSettings(
    categoryId: string,
    accessToken: string,
    additionalData: any
  ): void {
    this.categoryService.getCategoryById(categoryId).subscribe((category) => {
      const modelFields = category.data.model_fields;
      const queryParams = { model: category.data.model };

      this.settingsService.getSettings(accessToken, queryParams).subscribe(
        (setting) => {
          if (setting.data) {
            this.transformFields(modelFields, setting.data, additionalData);
          } else {
            console.error('No data found in settings.');
          }
        },
        (error) => {
          console.error('Error fetching settings:', error);
        }
      );
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

  fetchRelatedAds(userId: string, categoryId: string): void {
    let count = 0;
    const innerObservables: Observable<any>[] = [];

    this.adService.getAds('pending').subscribe((adsData) => {
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
      console.log('catttttteg', this.selectedOption.id, this.ad.category);
    }
  }

  createSetting(settingADS: { [key: string]: any }, accessToken: string): void {
    this.annonceService
      .insertSetting(this.adId, 'ad-models', settingADS, accessToken)
      .subscribe(
        () => {
          //this.uploadFilesAndUpdateAnnonce(accessToken);
          console.log('create');
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
      this.selectedFiles.map((file) => {
        return this.annonceService
          .uploadFile(file, accessToken)
          .then((response) => {
            mediaIds.push(response.data.id);
          });
      })
    )
      .then(() => {
        const annonceData = this.createAnnonceData(mediaIds);
        this.annonceService
          .updateAnnonce(this.adId, this.ad.uuid, annonceData, accessToken)
          .subscribe(() => {
            const settingADS: { [key: string]: any } = {};
            for (let i = 0; i < this.settings.length; i++) {
              const setting = this.settings[i];
              if (setting.selectedOption) {
                settingADS[setting.name] = setting.selectedOption.value;
              }
            }
            this.annonceService
              .UpdateSetting(this.adId, settingADS, accessToken)
              .subscribe(
                () => {
                  //this.uploadFilesAndUpdateAnnonce(accessToken);
                  console.log('update');
                },
                (error) => {
                  console.error(
                    'Error inserting state and genre:',
                    error.error.message
                  );
                  if (error.error.message === "This AdBook doesn't exists") {
                    this.createSetting(settingADS, accessToken);
                  }
                }
              );
            window.location.reload();
          });
      })
      .catch((error) => {
        console.error('Error uploading files:', error);
      });
  }

  createAnnonceData(mediaIds: string[]): any {
    return {
      user_id: this.ad.user.id,
      category_id: this.selectedOption.id,
      title: this.ad.title,
      description: this.ad.description,
      state: this.ad.state,
      urgent: this.ad.urgent,
      highlighted: this.ad.highlighted,
      price: parseFloat(this.ad.price),
      city: this.ad.ville,
      postal_code: this.ad.code_postal,
      medias: { _ids: mediaIds },
      validation_status: 'pending',
    };
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
      this.settings = [];
      this.fetchCategories();
      this.fetchSettings();
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
    const date = new Date(dateString);
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
