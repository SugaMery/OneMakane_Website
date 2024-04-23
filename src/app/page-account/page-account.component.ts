import { Component, EventEmitter, HostListener, Output } from '@angular/core';
import { AuthGuard } from '../auth.guard';
import { Router } from '@angular/router';
import { UserService } from '../user.service';
import { CategoryService } from '../category.service';
import { AnnonceService } from '../annonce.service';
import { SettingService } from '../setting.service';
declare var $: any;
interface Category {
  active: boolean;
  created_at: string;
  id: number;
  model: any; // Adjust this type according to the actual type of 'model'
  route: any; // Adjust this type according to the actual type of 'model'
  name: string;
  parent_id: number | null;
  slug: string | null;
  url: string | null;
}
@Component({
  selector: 'app-page-account',
  templateUrl: './page-account.component.html',
  styleUrl: './page-account.component.css',
})
export class PageAccountComponent {
  userInfo: any;
  loggedInUserName: string | undefined;

  deletedImages: string[] = [];
  uploadedImages: string[] = [];

  categories: Category[] = [];
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
    files: [], // Contiendra les fichiers sélectionnés
  };
  formAds = {
    user_id: 29,
    category_id: 54,
    title: 'minus corrupti mollitia',
    description:
      'Ea impedit tenetur dolor ut tempore magnam distinctio ullam. Dolorem nesciunt hic sunt ullam deleniti quibusdam.',
    state: 'good',
    urgent: true,
    highlighted: true,
    price: 94506.53,
    city: 'Pittsfield',
    postal_code: '77807-3426',
    medias: {},
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
  };
  uploadedImageIds: number[] = [];

  optionsVisible: boolean = false;
  urgentChecked: boolean = false;
  highlightedChecked: boolean = false;
  uploadedImage: string[] = [];
  selectedFiles: File[] = [];
  representatives: any;
  constructor(
    private authService: AuthGuard,
    private router: Router,
    private annonceService: AnnonceService,
    private userService: UserService,
    private categoryService: CategoryService,
    private settingsService: SettingService
  ) {}
  settings: any;
  ngOnInit(): void {
    this.getUserInfo();
    this.fetchCategories();
    const userId = localStorage.getItem('loggedInUserId');
    const accessToken = localStorage.getItem('loggedInUserToken');

    console.log('tt', userId?.toString);
    this.annonceService.getAds(accessToken!).subscribe((data) => {
      const adIds = data.data.map((ad: any) => ad.id);

      const adPromises = adIds.map((adId: any) => {
        return this.annonceService.getAdById(adId, accessToken!).toPromise();
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
              console.log('Ad date : ', ad.data.created_at);
              return ad.data;
            });
        })
        .catch((error) => {
          // Handle error
        });
    });

    this.statuses = [
      { label: 'INSTOCK', value: 'instock' },
      { label: 'LOWSTOCK', value: 'lowstock' },
      { label: 'OUTOFSTOCK', value: 'outofstock' },
    ];
  }

  extractDate(dateTimeString: string): string {
    const date = new Date(dateTimeString);
    if (isNaN(date.getTime())) {
      console.error('Invalid date value:', dateTimeString);
      return ''; // Retourner une chaîne vide ou une valeur par défaut si la date est invalide
    } else {
      return date.toISOString().split('T')[0];
    }
  }

  resetFormData(): void {
    // Réinitialiser les données du formulaire
    this.formData = {
      titre: '',
      description: '',
      prix: '',
      category_id: 0, // Remplacer 0 par la valeur par défaut appropriée
      state: '',
      genre: '',
      urgent: false,
      highlighted: false,
      ville: '',
      code_postal: '',
      files: [], // Remplacer [] par la valeur par défaut appropriée
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
    this.categoryService.getCategoriesFrom(accessToken!).subscribe(
      (categories) => {
        this.categories = categories.data.filter(
          (category: Category) => category.active === true
        );
        console.log('Filtered Categories:', this.categories);
      },
      (error) => {
        console.error('Error fetching categories: ', error);
      }
    );
  }

  uploadFiles() {
    const accessToken = localStorage.getItem('loggedInUserToken');
    if (!accessToken) {
      console.error('Access token not found in local storage.');
      return;
    }

    this.selectedFiles.forEach((file) => {
      this.annonceService
        .uploadFile(file, accessToken)
        .then((response) => {
          // Assuming response contains the URL of the uploaded image
          // You can handle the response as needed
          console.log('File uploaded successfully:', response);
        })
        .catch((error) => {
          console.error('Error uploading file:', error);
        });
    });

    // Clear selected files array after uploading
    this.selectedFiles = [];
  }
  maxImages = false;
  onFileSelected(event: any) {
    const maxImagesAllowed = 3;
    const files: FileList = event.target.files;

    if (files && files.length > 0) {
      // Vérifiez si le nombre total d'images téléchargées ne dépasse pas le maximum autorisé
      if (this.uploadedImages.length + files.length > maxImagesAllowed) {
        this.maxImages = true;
        console.log("Vous ne pouvez télécharger que jusqu'à 3 images.");
        return; // Arrêtez le processus si le nombre dépasse la limite
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

  selectOption(category: Category): void {
    this.selectedOption = category;
    this.formData.category_id = category.id; // Update formData with selected category ID
    this.fieldErrors.category = false; // Clear category error when category is selected
    this.optionsVisible = false;
    this.selectedState = null;
    this.fetchStates();

    this.genreOptionsVisible = false;
    this.fetchGenres();
  }

  selectedCategory: any; // Selected category object
  selectedState: any; // Selected state
  states: any[] = []; // Array to hold states
  stateOptionsVisible = false; // Flag to show/hide state options
  // other properties and constructor

  fetchStates(): void {
    if (this.selectedOption) {
      const userId = localStorage.getItem('loggedInUserId');
      const accessToken = localStorage.getItem('loggedInUserToken');
      const queryParams = { name: 'state', model: this.selectedOption.model };
      this.settingsService.getSettings(accessToken!, queryParams).subscribe(
        (response) => {
          if (response.status === 'Success' && response.data) {
            const data = JSON.parse(response.data);
            this.states = Object.keys(data).map((key) => ({
              name: data[key],
              value: key,
            }));
          }
        },
        (error) => {
          console.error('Error fetching states:', error);
        }
      );
    }
  }

  selectState(state: any): void {
    this.selectedState = state;
    this.stateOptionsVisible = false;
    this.fieldErrors.state = false;
    this.formData.state = state.value;
  }
  selectedCategoryState: boolean = false;
  toggleStateOptions(): void {
    if (this.selectedOption.model != null) {
      this.stateOptionsVisible = !this.stateOptionsVisible;
      this.optionsVisible = false;
      this.selectedCategoryState = false;
      this.genreOptionsVisible = false;
    } else {
      this.selectedCategoryState = true;
    }
  }

  onSubmit(): void {
    // Vérifier si les champs "Ville" et "Code postal" sont remplis
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

    // Si les champs ne sont pas remplis, arrêter l'exécution
    if (!isValid) {
      return;
    }

    // Si les champs sont remplis, continuer avec la soumission du formulaire
    const accessToken = localStorage.getItem('loggedInUserToken');
    const userId = localStorage.getItem('loggedInUserId');

    if (!accessToken) {
      console.error('Access token not found in local storage.');
      return;
    }

    const mediaIds: string[] = [];

    Promise.all(
      this.selectedFiles.map((file) => {
        return this.annonceService
          .uploadFile(file, accessToken)
          .then((response) => {
            mediaIds.push(response.data.id);
            console.log('File uploaded successfully:', response);
          })
          .catch((error) => {
            console.error('Error uploading file:', error);
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

      this.annonceService.createAnnonce(annonceData, accessToken!).subscribe(
        (response) => {
          const addressTabLink = document.querySelector(
            '#orders-tab'
          ) as HTMLAnchorElement;

          if (addressTabLink) {
            addressTabLink.click();
          }
          console.log(
            'eeeee',
            response.data.id,
            this.selectedOption.model.Remplacer,
            this.formData.state,
            this.formData.genre
          );

          this.resetFormData();

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
  }
  adDialog: boolean = false;
  selectedAd: any; // To store the selected ad object

  showDialog(ad: any) {
    this.selectedAd = ad; // Set the selected ad object
    this.adDialog = true;
  }

  hideDialogs() {
    this.adDialog = false;
  }
  selectedCategoryGenre = false;
  selectedGenre: any; // Selected genre
  genres: any[] = []; // Array to hold genres
  genreOptionsVisible = false; // Flag to show/hide genre options
  // other properties and constructor
  fetchGenres(): void {
    const userId = localStorage.getItem('loggedInUserId');
    const accessToken = localStorage.getItem('loggedInUserToken');
    const queryParams = { name: 'genre', model: this.selectedOption.model };
    this.settingsService.getSettings(accessToken!, queryParams).subscribe(
      (response) => {
        if (response.status === 'Success' && response.data) {
          const data = JSON.parse(response.data);
          this.genres = Object.keys(data).map((key) => ({
            name: data[key],
            value: key,
          }));
        }
      },
      (error) => {
        console.error('Error fetching genres:', error);
      }
    );
  }

  selectGenre(genre: any): void {
    this.selectedGenre = genre;
    this.toggleGenreOptions(); // Close dropdown after selection
    this.fieldErrors.genre = false;
    this.formData.genre = genre.value; // Update formData with selected category ID
    console.log('genre', this.formData.genre);
  }

  toggleGenreOptions(): void {
    if (this.selectedOption.model != null) {
      this.genreOptionsVisible = !this.genreOptionsVisible;
      this.optionsVisible = false;
      this.stateOptionsVisible = false;
      this.selectedCategoryGenre = false;
    } else {
      this.selectedCategoryGenre = true;
    }
  }

  toggleOptions(): void {
    this.optionsVisible = !this.optionsVisible;
    this.stateOptionsVisible = false;
    this.genreOptionsVisible = false;
  }

  toggleUrgent(checked: boolean) {
    this.formData.urgent = checked;
    console.log('urgent', checked, this.formData.urgent);
  }

  toggleHighlighted(checked: boolean) {
    this.formData.highlighted = checked;
    console.log('highlighted', checked, this.formData.highlighted);
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
    category: boolean; // Add category field,
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
    code_postal: false, // Initialize category field error to false
  };

  clearError(fieldName: string): void {
    this.fieldErrors[fieldName] = false;
  }

  emitNextCallback(): boolean {
    // Assurez-vous que uploadedImages contient les chemins des images à télécharger
    let isValid = true;

    // Vérifier si les champs requis sont vides
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
      return false; // Arrêter la soumission du formulaire si la catégorie n'est pas sélectionnée
    }

    // Si un champ requis est vide, arrêter le processus
    if (!isValid) {
      return false;
    }

    // Si tous les champs sont remplis, permettre le passage à l'étape suivante
    return true;
  }
  @Output() nextCallback: EventEmitter<any> = new EventEmitter();

  // Function to convert data URI to Blob
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
  productDialog: boolean = false;

  ads!: any[];

  product!: any;

  selectedads!: any[] | null;

  submitted: boolean = false;

  statuses!: any[];

  openNew() {
    this.product = {};
    this.submitted = false;
    this.productDialog = true;
  }

  hideDialog() {
    this.productDialog = false;
    this.submitted = false;
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
}
