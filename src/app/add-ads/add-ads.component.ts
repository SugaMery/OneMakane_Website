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
  parentCategoy ?: Category;
  icon_path :string;
  content?: string;
  label?: string;
}
interface DropdownOption {
  id: number;
  name: string;
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
  selectedOption?:SelectedOption;

    optionsVisible?: boolean ; // Ajoutez cette ligne

  
}
interface SelectedOption{
  value : string;
  label :string
}
interface CustomCategory {
  name: string;
  keywords: string[];
  icon_path: string;
  subcategories?: SubCategory[]; // Ajoutez la propriété subcategories
}

// Définir une interface pour les sous-catégories
interface SubCategory {
  id ? : number;
  name: string;
  keywords: string[];
  isChecked? : boolean;
  model ?:string
}
@Component({
  selector: 'app-add-ads',
  templateUrl: './add-ads.component.html',
  styleUrl: './add-ads.component.css'
})
export class AddAdsComponent {
  userInfo: any;
  loggedInUserName: string | undefined;
  
  deletedImages: string[] = [];
  uploadedImages: string[] = [];
  selectedSubCategory: SubCategory | null = null;
  categories: Category[] = [];
  formData = {
    titre: '',
    description: '',
    prix: '',
    category_id: 0,
    state: '',
    genre:'',
    urgent: false,
    highlighted: false,
    ville: '',
    code_postal: '',
    files: [] // Contiendra les fichiers sélectionnés
  };

  selectedOption: Category = { 
    active: false,
    created_at: "",
    id: 0,
    model: null,
    name: "",
    parent_id: null,
    slug: null,
    route:null,
    url: null,
    icon_path : ""
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
  formDataCustom: any = {}; // Assurez-vous que formData est initialisé correctement

  // Define suggestedCategory as CustomCategory type
  suggestedCategory!: CustomCategory | null;

  // Liste de catégories avec leurs mots-clés associés
  Customcategories: CustomCategory[] = [
    { 
      name: "Immobilier", 
      keywords: ["appartement", "maison", "terrain"], 
      icon_path: "http://localhost:3000/uploads/voitures.png",
      subcategories: [
        { name: "Appartements de luxe", keywords: ["luxe", "penthouse"] },
        { name: "Maisons avec piscine", keywords: ["piscine", "jardin"] }
      ]
    },
    { 
      name: "Véhicules", 
      keywords: ["voiture", "moto", "camion"], 
      icon_path: "http://localhost:3000/uploads/voitures.png",
      subcategories: [
        { 
          name: "Voitures", 
          keywords: [
            "Voiture", "berline", "SUV", "coupé", "cabriolet", "break", "monospace", "citadine", "hybride", "électrique", "sportive",
            "audi", "bmw", "citroen", "fiat", "ford", "mercedes-benz", "opel", "peugeot", "renault", "volkswagen",
            "abarth", "ac", "aiways", "aixam", "alfa romeo", "allard", "alpine", "alpina", "aston martin", "austin", "austin healey", 
            "autobianchi", "auverland", "bentley", "bmw-alpina", "bugatti", "buick", "byd", "cadillac", "casalini", "caterham", 
            "chevrolet", "chevrolet usa", "chrysler", "cupra", "dacia", "daewoo", "daihatsu", "daimler", "dangel", "datsun", "delorean", 
            "dodge", "ds", "ferrari", "fisker", "ford allemagne", "ford angleterre", "ford france", "ford usa", "general motors", 
            "honda", "hummer", "hyundai", "imperial", "ineos", "infiniti", "innocenti", "isuzu", "jaguar", "jeep", "kia", "ktm", 
            "lada", "lamborghini", "lancia", "land-rover", "lexus", "ligier", "lincoln", "lotus", "lynk&co", "mahindra", "maserati", 
            "mazda", "mclaren", "mega", "mercury", "mg", "mg motor", "mia electric", "microcar", "mini", "mitsubishi", "morgan", 
            "nissan", "nsu", "oldsmobile", "opel", "pagani", "panhard", "peterbilt", "peugeot", "piaggio", "plymouth", "pontiac", 
            "porsche", "rambler", "reliant", "renault", "renault usa", "rolls-royce", "rover", "saab", "santana", "seat", "seres", 
            "simca", "singer", "skoda", "smart", "ssangyong", "subaru", "suzuki", "talbot", "tata", "tesla", "toyota", "triumph", 
            "tvr", "vauxhall", "venturi", "vespa", "volkswagen", "volvo", "wiesmann", "xiaomi", "zastava", "zaz" ,"golf"
          ]
        },
        
        { 
          name: "Motos", 
          keywords: [
            "Voiture", "sportive", "custom", "naked", "trail", "touring", "scooter", "cross", "enduro", "street", "café racer",
            "aprilia", "benelli", "beta", "bimota", "bmw", "bullit", "brixton", "cagiva", "cf moto", "daelim", "derbi", "ducati",
            "fantic", "fb mondial", "gas gas", "harley-davidson", "honda", "husqvarna", "indian", "kawasaki", "keeway", "ktm", 
            "kymco", "lambretta", "laverda", "macbor", "malaguti", "masai", "mondial", "moto guzzi", "moto morini", "mv agusta", 
            "niu", "norton", "peiying", "peugeot", "piaggio", "riel", "riya", "royal enfield", "scorpa", "sherco", "sinnis", 
            "suzuki", "sym", "triumph", "trk", "um", "ural", "vespa", "victoria", "voge", "volta", "vor", "voxan", "yamaha", 
            "zero", "zinmoto", "autre"
          ]
        },

                { name: "Caravaning", keywords: ["Caravaning", "camping-car", "caravane", "van aménagé", "mobil-home", "remorque", "véhicule de loisirs", "autocaravane", "roulotte", "fourgon", "motorhome"] },
        { name: "Utilitaires", keywords: ["Utilitaires", "fourgonnette", "camionnette", "pickup", "fourgon utilitaire", "camion-benne", "véhicule utilitaire léger", "fourgon frigorifique", "véhicule de chantier", "camion-grue", "camion-plateau"] },
        { name: "Camions", keywords: ["Camions", "tracteur", "semi-remorque", "camion-benne", "camion-citerne", "camion-remorque", "camion-porteur", "camion-grue", "camion-plateau", "camion frigorifique", "camion ampliroll"] },
        { name: "Nautisme", keywords: ["Nautisme", "bateau", "voilier", "yacht", "jet ski", "barque", "catamaran", "pneumatique", "kayak", "planche à voile", "paddle"] },
        { name: "Vélos", keywords: ["Vélos", "vélo de route", "VTT", "vélo électrique", "vélo de ville", "vélo pliant", "vélo cargo", "BMX", "vélo de course", "vélo tandem", "vélo de montagne"] },
        { name: "Équipement auto", keywords: ["Équipement auto", "pneu", "batterie", "huile moteur", "filtre à air", "accessoire auto", "outil de réparation", "siège auto", "autoradio", "antivol", "ampoule de phare"] },
        { name: "Équipement moto", keywords: ["Équipement moto", "casque", "gants", "blouson moto", "bottes", "pantalon moto", "protection dorsale", "antivol moto", "sac à dos moto", "intercom moto", "équipement pluie"] },
        { name: "Équipement caravaning", keywords: ["Équipement caravaning", "store", "auvent", "porte-vélo", "éclairage extérieur", "batterie auxiliaire", "réservoir d'eau", "tapis de sol", "barbecue", "réfrigérateur portable", "moustiquaire"] },
        { name: "Équipement nautisme", keywords: ["Équipement nautisme", "gilet de sauvetage", "bouée", "combinaison de plongée", "masque de plongée", "palmes", "ancre", "corde marine", "échelle de bain", "bouée tractée", "sondeur GPS"] },
        { name: "Équipements vélos", keywords: ["Équipements vélos", "casque", "gants", "vêtements cyclistes", "porte-bagages", "béquille", "antivol vélo", "pompe à vélo", "panier vélo", "remorque vélo", "sonnette"] },
        { name: "Services de réparations mécaniques", keywords: ["Services de réparations mécaniques", "garage automobile", "mécanicien", "carrosserie", "entretien auto", "réparation moteur", "diagnostic électronique", "vidange", "contrôle technique", "équilibrage des pneus", "révision véhicule"] }
      ]
    },  // Ajoutez d'autres catégories avec leurs mots-clés associés ici
  ];
// Méthode pour gérer la sélection exclusive
selectSubCategory(subcategory: SubCategory) {
  console.log("subcategory detail", subcategory);
  
  // Si la sous-catégorie est déjà sélectionnée, déselectionnez-la
  if (this.selectedSubCategory === subcategory) {
      // Si la sous-catégorie actuelle est déjà sélectionnée, déselectionnez-la
      this.selectedSubCategory = null;
  } else {
      // Sinon, sélectionnez la nouvelle sous-catégorie
      this.selectedSubCategory = subcategory;
      this.selectedOption = { 
        active: false,
        created_at: "",
        id: 0,
        model: null,
        name: "",
        parent_id: null,
        slug: null,
        url: null,
        route:null,
        icon_path: ""
      };
        this.fieldErrors['category'] = false;
        this.formData.category_id = this.selectedSubCategory.id!;
      // Décochez toutes les autres sous-catégories
      this.suggestedCategory!.subcategories!.forEach((sub: SubCategory) => {
          if (sub !== subcategory) {
              sub.isChecked = false;
          }
      });
  }
}
  suggestedCategoryIf :boolean  = false ;
  suggestedsubcategoryIf : boolean = false ;
  suggestedCategorys =[];
 // Fonction déclenchée lors du changement de titre
onTitleChange(title: string) {
  this.fieldErrors['titre'] = false;
  this.suggestedCategory = this.suggestCategory(title);
  if(title){
    this.suggestedCategoryIf = true ;

  }else{
    this.suggestedCategoryIf = false ;

  }
  this.suggestedsubcategoryIf = false;
  if(this.suggestedCategory){
    for(let j=0 ; j< this.suggestedCategory!.subcategories!.length ; j++){
      for(let i=0 ; i<this.categories.length ;i++){
      if(this.categories[i].name === this.suggestedCategory!.subcategories![j].name ){
        this.suggestedCategory!.subcategories![j].id= this.categories[i].id ;
        this.suggestedCategory!.subcategories![j].model= this.categories[i].model ;
        this.suggestedsubcategoryIf = true ;
        
        console.log("test SubCategory" ,this.categories[i].name );
      }else{
        console.log("test SubCategory not good");
        //this.suggestedCategoryIf = false ;

      }

    }
  }
  }

  console.log('suggestedCategories', this.suggestedCategory);
}

// Méthode pour vérifier si les mots-clés sont disponibles pour une sous-catégorie
hasKeywords(subcategory: SubCategory): boolean {
  return subcategory && subcategory.keywords && subcategory.keywords.length > 0;
}


selectedOptiond: any; // Assurez-vous que selectedOption est initialisée correctement
optionsVisibled: boolean = false; // Assurez-vous que optionsVisible est initialisée correctement

// Suppose que le contenu JSON est stocké dans selectedOption.content
parseOptions(content: string | StringIndexed): { value: string, label: string }[] {
  if (typeof content === 'string') {
    const options = JSON.parse(content);
    // Assurez-vous que options est un objet avant de le traiter
    if (typeof options === 'object' && options !== null) {
      // Utilisez Object.keys pour obtenir les clés de l'objet et mappez-les comme précédemment
      return Object.keys(options).map(key => ({ value: key, label: options[key] }));
    } else {
      // Gérez le cas où JSON.parse ne retourne pas un objet valide
      console.error('Le contenu JSON n\'a pas pu être analysé correctement.');
      return [];
    }
  } else if (typeof content === 'object') {
    // Utilisez Object.keys pour obtenir les clés de l'objet et mappez-les comme précédemment
    return Object.keys(content).map(key => ({ value: key, label: content[key] }));
  } else {
    // Si le contenu n'est ni une chaîne ni un objet, retournez un tableau vide
    console.error('Le contenu n\'est ni une chaîne ni un objet.');
    return [];
  }
}

toggledOptions(setting: Setting): void {
  // Fermer toutes les boîtes d'options sauf celle sur laquelle vous venez de cliquer
  this.settings.forEach(s => {
    if (s !== setting) {
      s.optionsVisible = false;
    }
  });

  // Inverser la visibilité de la boîte d'options actuelle
  setting.optionsVisible = !setting.optionsVisible;
}

selectdOptiond(option: any, setting: Setting): void {
  setting.selectedOption = option; // Mettre à jour la sélection pour le setting actuel
  console.log("selectedOption",setting.selectedOption)
  setting.optionsVisible = false; // Fermer la boîte d'options
}

selectdOption(option: any) {
  this.selectedOption = option;
  this.optionsVisible = false; // Fermer la liste déroulante après avoir sélectionné une option
  // Autres actions à effectuer après avoir sélectionné une option, par exemple :
  // Enregistrer la sélection dans une variable ou effectuer une action basée sur l'option sélectionnée
}


suggestCategory(title: string): CustomCategory | null {
  for (const category of this.Customcategories) {
    const matchingSubcategories: SubCategory[] = [];

    for (const subcategory of category.subcategories || []) {
      if (this.hasKeywords(subcategory)) {
        for (const subKeyword of subcategory.keywords) {
          if (title.toLowerCase().includes(subKeyword.toLowerCase())) {
            console.log('Matched subcategory:', subcategory);
            matchingSubcategories.push(subcategory);
            // Sortir de la boucle dès qu'une correspondance est trouvée pour cette sous-catégorie
            break;
          }
        }
      }
    }

    if (matchingSubcategories.length > 0) {
      // Créer une copie de la catégorie avec les sous-catégories correspondantes
      const matchedCategory: CustomCategory = {
        ...category,
        subcategories: matchingSubcategories
      };
      return matchedCategory;
    }
  }

  return null; // Aucune catégorie correspondante trouvée
}








  ngOnInit(): void {
    this.getUserInfo();
    this.fetchCategories();
    const userId = localStorage.getItem('loggedInUserId');
    const accessToken = localStorage.getItem('loggedInUserToken');


    console.log('tt',userId?.toString)
    this.annonceService
    .getAds(accessToken!)
    .subscribe((data) => {
        const adIds = data.data.map((ad: any) => ad.id);
         
        const adPromises = adIds.map((adId: any) => {
          return this.annonceService.getAdById(adId, accessToken!).toPromise();
        });
  
        Promise.all(adPromises)
          .then((adsData) => {
            this.ads = adsData
              .filter((ad: any) => ad.data.user_id === Number(userId) )
              .map((ad: any) => {
                const createdAt = ad.data.medias && ad.data.medias.length > 0 ? ad.data.medias[0].created_at : ad.data.created_at;
                ad.data.created_at = this.extractDate(createdAt);
                console.log("Ad date : ", ad.data.created_at);
                return ad.data;
              });
          })
          .catch((error) => {
            // Handle error
          });
    });
  
  


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
      genre :'',
      urgent: false,
      highlighted: false,
      ville: '',
      code_postal: '',
      files: [] // Remplacer [] par la valeur par défaut appropriée
    };
  }
  
  getUserInfo(): void {
    if (typeof localStorage !== 'undefined') {
      const userId = localStorage.getItem('loggedInUserId');
      const accessToken = localStorage.getItem('loggedInUserToken');
      if (userId && accessToken) {
        this.userService.getUserInfoById(Number(userId), accessToken).subscribe(userInfo => {
          this.userInfo= userId;
          this.loggedInUserName = `${userInfo.data.first_name} ${userInfo.data.last_name}`;
        });
      }
    }
  }
  parent : Category | undefined;
  fetchCategories(): void {
    const accessToken = localStorage.getItem('loggedInUserToken');
    if (!accessToken) {
      console.error('Access token not found in localStorage');
      return;
    }
  
    this.categoryService.getCategoriesFrom(accessToken).subscribe(
      categories => {
   
        this.categories = categories.data.filter((category: Category) => category.active === true && category.parent_id !== null);
        console.log('Categories:', categories.data);
        for (let i = 0; i < this.categories.length; i++) {
          const parentId = this.categories[i].parent_id?.toString(); 
          const Id = this.categories[i].id?.toString();// Convert to string or null if parent_id is null
          if (!parentId) {
            console.error('Parent ID is null');
            continue;
          }
          this.categoryService.getCategoryById(parentId, accessToken).subscribe(parent  => this.categories[i].parentCategoy=parent.data);
         
      this.categoryService.getCategoryById(Id, accessToken).subscribe(parent  => this.categories[i].icon_path=parent.data.icon_path);
          
 
        }
        console.log('Filtered Categories:', this.categories);
      },
      error => {
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

    this.selectedFiles.forEach(file => {
      this.annonceService.uploadFile(file, accessToken).then(response => {
        // Assuming response contains the URL of the uploaded image
        // You can handle the response as needed
        console.log('File uploaded successfully:', response);
      }).catch(error => {
        console.error('Error uploading file:', error);
      });
    });

    // Clear selected files array after uploading
    this.selectedFiles = [];
  }
  maxImages =false ;
  onFileSelected(event: any) {
    const maxImagesAllowed = 3;
    const files: FileList = event.target.files;

    if (files && files.length > 0) {
        // Vérifiez si le nombre total d'images téléchargées ne dépasse pas le maximum autorisé
        if (this.uploadedImages.length + files.length > maxImagesAllowed) {
          this.maxImages = true ;
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

  emitNextCallbackTitre() : boolean {

    let isValid = true;
    
    // Vérifier si les champs requis sont vides
    if (!this.formData.titre) {
        this.fieldErrors.titre = true;
        isValid = false;
    } else {
        this.fieldErrors.titre = false;
    }




    if (!this.formData.category_id) {
        this.fieldErrors.category = true;
        return false; // Arrêter la soumission du formulaire si la catégorie n'est pas sélectionnée
    }



    // Si un champ requis est vide, arrêter le processus
    if (!isValid) {
        return false;
    }
  this.fetchSettings();
    // Si tous les champs sont remplis, permettre le passage à l'étape suivante
    return true;

  }

  selectOption(category: Category): void {
    this.selectedOption = category;
    if(this.selectedOption){
      this.formData.category_id = category.id; // Update formData with selected category ID

    }
    else{
        if(this.selectedSubCategory!.id){
          this.formData.category_id = this.selectedSubCategory!.id;
           // Update formData with selected category ID
        }
    }

    this.fieldErrors.category = false; // Clear category error when category is selected
    this.optionsVisible = false;    
    this.selectedState = null;
    this.fetchStates();
    this.selectedSubCategory = null;
    this.genreOptionsVisible=false;
    this.fetchGenres();
  
  }

  selectedCategory: any; // Selected category object
  selectedState: any; // Selected state
  states: any[] = []; // Array to hold states
  stateOptionsVisible = false; // Flag to show/hide state options
  // other properties and constructor
  settings: Setting[] = [];
  fetchSettings(): void {
    const queryParams = { model: this.selectedOption.model }; // Vous pouvez ajuster le modèle si nécessaire
    const accessToken = localStorage.getItem('loggedInUserToken');
  
    this.settingsService.getSettings(accessToken!, queryParams).subscribe(
      (response: any) => {
        console.log("reponse",response.data);
        this.settings = response.data.map((setting: any) => {
          return { content: setting.content, optionsVisible: false }; // Initialiser la propriété optionsVisible pour chaque setting
        });
      }
    );
  }


  fetchStates(): void {
    if (this.selectedOption) {
      const userId = localStorage.getItem('loggedInUserId');
      const accessToken = localStorage.getItem('loggedInUserToken');        
      const queryParams = { name: 'state', model: this.selectedOption.model };
      this.settingsService.getSettings(accessToken!, queryParams).subscribe(
        (response) => {
          if (response.status === "Success" && response.data) {
            const data = JSON.parse(response.data);
            this.states = Object.keys(data).map(key => ({ name: data[key], value: key }));
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
    this.stateOptionsVisible=false;
    this.fieldErrors.state = false;
  this.formData.state=state.value;

  }
  selectedCategoryState : boolean = false;
  toggleStateOptions(): void {
    if(this.selectedOption.model != null){
      this.stateOptionsVisible = !this.stateOptionsVisible;
      this.optionsVisible =false;
      this.selectedCategoryState = false ;
      this.genreOptionsVisible = false ;

    }else{
      this.selectedCategoryState = true
    }
  }


  onSubmits(){
    console.log("Catégorie sélectionnée :", this.suggestedCategory);
    console.log("Autres informations du formulaire :", this.formData);
  }

    onSubmit(): void {
      // Vérifier si les champs "Ville" et "Code postal" sont remplis
      let isValid = true;
      console.log("Catégorie sélectionnée :", this.suggestedCategory);
    console.log("Autres informations du formulaire :", this.formData);
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
    
      Promise.all(this.selectedFiles.map(file => {
        return this.annonceService.uploadFile(file, accessToken).then(response => {
          mediaIds.push(response.data.id);
          console.log('File uploaded successfully:', response);
        }).catch(error => {
          console.error('Error uploading file:', error);
          throw error;
        });
      })).then(() => {
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
            "_ids": mediaIds
          },
          validation_status: 'pending'
        };
    
        this.annonceService.createAnnonce(annonceData, accessToken!)
          .subscribe(
            response => {
              const addressTabLink = document.querySelector('#orders-tab') as HTMLAnchorElement;
    
              if (addressTabLink) {
                  addressTabLink.click();
              }
              console.log('eeeee',response.data.id, this.selectedOption.model.Remplacer, this.formData.state, this.formData.genre);
              this.annonceService.insertStateAndGenre(response.data.id, this.selectedOption.route, this.formData.state, this.formData.genre,accessToken).subscribe(
                (response) => {
                  console.log('State and genre inserted successfully:', response);
                  // Handle success response
                },
                (error) => {
                  console.error('Error inserting state and genre:', error);
                  // Handle error
                }
              );
              this.resetFormData();

              this.selectedOption =  { 
                active: false,
                created_at: "",
                id: 0,
                model: null,
                name: "",
                parent_id: null,
                slug: null,
                url: null,
                route:null,
                icon_path: ""
              };
              console.log('Annonce créée avec succès !', response);

            },
            error => {
              console.error('Erreur lors de la création de l\'annonce :', error);
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
        this.genreOptionsVisible = false ;
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
    selectedCategoryGenre =false;
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
          if (response.status === "Success" && response.data) {
            const data = JSON.parse(response.data);
            this.genres = Object.keys(data).map(key => ({ name: data[key], value: key }));
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
   console.log('genre',this.formData.genre)
    }
  
    toggleGenreOptions(): void {

      if(this.selectedOption.model != null){
        this.genreOptionsVisible = !this.genreOptionsVisible;
        this.optionsVisible =false;
        this.stateOptionsVisible=false ;
        this.selectedCategoryGenre = false ;  
      }else{
        this.selectedCategoryGenre = true
      }

    }
  
  toggleOptions(): void {
    this.optionsVisible = !this.optionsVisible;
   this.fieldErrors['category'] = false;
    this.stateOptionsVisible=false;
    this.genreOptionsVisible =false ;
    
  }

  toggleUrgent(checked: boolean) {
    this.formData.urgent = checked;
    console.log('urgent',checked,this.formData.urgent);
  }
  
  toggleHighlighted(checked: boolean) {
    this.formData.highlighted = checked;
    console.log('highlighted',checked,this.formData.highlighted);
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
    genre :boolean;
    category: boolean; // Add category field,
    ville:boolean;
    code_postal:boolean
  } = {
    titre: false,
    description: false,
    prix: false,
    state: false,
    genre:false,
    category: false,
    ville:false ,
    code_postal:false// Initialize category field error to false
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
  switch(status) {
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

isBakingMaterialChecked: boolean = false;
}

