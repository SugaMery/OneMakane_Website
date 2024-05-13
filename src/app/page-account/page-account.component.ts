import { Component, EventEmitter, HostListener, Output } from '@angular/core';
import { AuthGuard } from '../auth.guard';
import { Router } from '@angular/router';
import { UserService } from '../user.service';
import { CategoryService } from '../category.service';
import { AnnonceService } from '../annonce.service';
import { SettingService } from '../setting.service';

@Component({
  selector: 'app-page-account',
  templateUrl: './page-account.component.html',
  styleUrl: './page-account.component.css',
})
export class PageAccountComponent {
  userInfo: any;
  loggedInUserName: string | undefined;
  userId!: string | null;
  accessToken!: string | null;
  idPro: any;

  constructor(
    private authService: AuthGuard,
    private router: Router,
    private annonceService: AnnonceService,
    private userService: UserService,
    private categoryService: CategoryService,
    private settingsService: SettingService
  ) {}
  settings: any;
  ads : any[]=[];
  ngOnInit(): void {
     this.userId = localStorage.getItem('loggedInUserId');
     this.accessToken = localStorage.getItem('loggedInUserToken');
     this.annonceService.getAds(this.accessToken!).subscribe((data) => {
      const adIds = data.data.map((ad: any) => ad.id);
       console.log("data ads",data.data);

       data.data.forEach((element:any)=>{
        //console.log("data element",element);

           this.annonceService.getAdById(element.id,this.accessToken!).subscribe((annonce)=>{
            //console.log("data annonce",annonce.data);

            if(annonce.data.user_id===this.userId){
              console.log("data",element);
            }
           })
       })
      const adPromises = adIds.map((adId: any) => {
        return this.annonceService.getAdById(adId, this.accessToken!).toPromise();
      });

      Promise.all(adPromises)
        .then((adsData) => {
          this.ads = adsData
            .filter((ad: any) => ad.data.user_id === Number(this.userId))
            .map((ad: any) => {
              console.log("data ads111",ad);

              const createdAt =
                ad.data.medias && ad.data.medias.length > 0
                  ? ad.data.medias[0].created_at
                  : ad.data.created_at;
             // ad.data.created_at = this.extractDate(createdAt);
              console.log('Ad date : ', ad.data.created_at);
              return ad.data;
            });
        })
        .catch((error) => {
          // Handle error
        });
    });
    this.userService.getUserInfoById(Number(this.userId),this.accessToken!).subscribe((data)=>{
         this.loggedInUserName=data.data.full_name;
         this.userService.getAllUsers(this.accessToken!).subscribe((alldata)=>{
          alldata.data.forEach((element: {
            professional: any;
            id: any; email: any; uuid: string; }) => {
            if(element.id == data.data.id){
              this.userData.uuid=  element.uuid;
              this.idPro = element.professional.id; 
            }
          });
         })
          this.userData.first_name = data.data.first_name;
          this.userData.last_name = data.data.last_name;
          this.userData.address = data.data.address;
          this.userData.city = data.data.city;
          this.userData.email = data.data.email;
          this.userData.postal_code= data.data.postal_code;
          this.userData.telephone = data.data.telephone;
        
          if (data.data.civility == 'Mr') {
            this.userData.civility =  this.selectedOption = 'Monsieur';
    
          } else {
            this.userData.civility =  this.selectedOption = 'Madame';
          }
          if (data.data.professional !== null) {
            this.showProfessionalAccount = true ;
            this.userDataPro.company_name = data.data.professional.company_name;
            this.userDataPro.company_address = data.data.professional.company_address;
            this.userDataPro.company_postal_code = data.data.professional.company_postal_code;
            this.userDataPro.activity_sector = data.data.professional.activity_sector;
            this.userDataPro.contact_first_name = data.data.professional.contact_first_name;
            this.userDataPro.ice = data.data.professional.ice;
            this.userDataPro.company_address_rest = data.data.professional.company_address_rest;
            this.userDataPro.company_city = data.data.professional.company_city;
            this.userDataPro.contact_email = data.data.professional.contact_email;
            this.userDataPro.contact_last_name = data.data.professional.contact_last_name;
          }
          
    })

  }
  logout(): void {
    this.authService.logout();
  }
  adDialog: boolean = false;
  selectedAd: any; // To store the selected ad object
  productDialog: boolean = false;


  product!: any;

  selectedads!: any[] | null;

  submitted: boolean = false;

  statuses!: any[];
  showDialog(ad: any) {
    this.selectedAd = ad; // Set the selected ad object
    this.adDialog = true;
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
  userData = {
    uuid:'',
    first_name: '',
    last_name: '',
    email: '',
    address: '',
    postal_code: '',
    telephone: '',
    city: '',
    civility: '',
    password: '',
    role_id: 2,
    repeat_password: '',
    professional: {},
    generatedSecurityCode: this.generateSecurityCode(),
    enteredSecurityCode: '',
    termsAccepted: false,
  };

  userDataPassword = {
    uuid:'',
    password: '',
    repeat_password: ''
  }
  userDataPro = {
    company_name: '',
    company_address: '',
    company_postal_code: '',
    activity_sector: '',
    contact_first_name: '',
    ice: '',
    company_address_rest: '',
    company_city: '',
    contact_email: '',
    contact_last_name: '',
  };

  fieldErrors: {
    [key: string]: boolean;
    uuid:boolean;
    first_name: boolean;
    last_name: boolean;
    email: boolean;
    address: boolean;
    postal_code: boolean;
    telephone: boolean; // Add category field,
    city: boolean;
    civility: boolean;
    password: boolean;
    repeat_password: boolean;
    termsAccepted: boolean;
    enteredSecurityCode: boolean;
    repeat_passwords: boolean;
    passwordMismatch : boolean;
    emailExists : boolean;

    company_name: boolean;
    company_address: boolean;
    company_postal_code: boolean;
    activity_sector: boolean;
    contact_first_name: boolean;
    ice: boolean;
    company_address_rest: boolean;
    company_city: boolean;
    contact_email: boolean;
    contact_last_name: boolean;
    security_code_incorect : boolean;
  } = {
    uuid:false,
    first_name: false,
    last_name: false,
    email: false,
    address: false,
    postal_code: false,
    telephone: false,
    ville: false,
    code_postal: false,
    city: false,
    civility: false,
    password: false,
    repeat_password: false,
    termsAccepted: false,
    enteredSecurityCode: false,
    repeat_passwords: false,
    emailExists : false,
    passwordMismatch : false,
    

    company_name: false,
    company_address: false,
    company_postal_code: false,
    activity_sector: false,
    contact_first_name: false,
    ice: false,
    company_address_rest: false,
    company_city: false,
    contact_email: false,
    contact_last_name: false,
    security_code_incorect : false
  };

  showProfessionalAccount: boolean = false;

  optionsVisible: boolean = false;
  selectedOption: string | null = null;

  toggleOptions(): void {
    this.optionsVisible = !this.optionsVisible;
  }

  selectOption(option: string): void {
    this.selectedOption = option;
    this.optionsVisible = false;
    this.fieldErrors.civility = false; // Clear category error when category is selected
  }

  civilityOptions = [
    { label: 'Monsieur', value: 'Mr' },
    { label: 'Madame', value: 'Mrs' },
  ];

  generateSecurityCode(): string {
    // Logic to generate a security code
    return Math.floor(1000 + Math.random() * 9000).toString();
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
  validateForm(): boolean {
    this.error="";
    let isValid = true;
  
    // Check if required fields are empty
    if (!this.userData.first_name) {
      this.fieldErrors.first_name = true;
      isValid = false;
    } else {
      this.fieldErrors.first_name = false;
    }

    // Add similar checks for other fields...
  
    if (!this.userData.last_name) {
      this.fieldErrors.last_name = true;
      isValid = false;
    } else {
      this.fieldErrors.last_name = false;
    }

    if (!this.userData.email) {
      this.fieldErrors.email = true;
      isValid = false;
    } else {
      this.fieldErrors.email = false;
    }

    if (!this.userData.address) {
      this.fieldErrors.address = true;
      isValid = false;
    } else {
      this.fieldErrors.address = false;
    }

    if (!this.userData.postal_code) {
      this.fieldErrors.postal_code = true;
      isValid = false;
    } else {
      this.fieldErrors.postal_code = false;
    }

    if (!this.userData.telephone) {
      this.fieldErrors.telephone = true;
      isValid = false;
    } else {
      this.fieldErrors.telephone = false;
    }

    if (!this.userData.city) {
      this.fieldErrors.city = true;
      isValid = false;
    } else {
      this.fieldErrors.city = false;
    }

/*     if (!this.userData.password) {
      this.fieldErrors.password = true;
      isValid = false;
    } else {
      this.fieldErrors.password = false;
    }

    if (!this.userData.repeat_password) {
      this.fieldErrors.repeat_password = true;
      isValid = false;
    } else {
      this.fieldErrors.repeat_password = false;
    } */






    if(this.selectedOption){
      if (this.selectedOption == 'Monsieur') {
        this.userData.civility = 'Mr';

      } else {
        this.userData.civility = 'Mrs';
      }

      if (!this.userData.civility) {
        this.fieldErrors.civility = true;
        isValid = false;
      } else {
        this.fieldErrors.civility = false;
      }
    }


    // Check if passwords match
/*     if (!this.fieldErrors.password && !this.fieldErrors.repeat_password) {
      if (this.userData.password !== this.userData.repeat_password) {
        this.fieldErrors.passwordMismatch = true;
        isValid = false;
      } else {
        this.fieldErrors.passwordMismatch = false;
      }
    } else {
      this.fieldErrors.passwordMismatch = false;
    } */


    if(this.showProfessionalAccount){
      if (!this.userDataPro.activity_sector) {
        this.fieldErrors.activity_sector = true;
        isValid = false;
      } else {
        this.fieldErrors.activity_sector = false;
      } 

      if (!this.userDataPro.company_address) {
        this.fieldErrors.company_address = true;
        isValid = false;
      } else {
        this.fieldErrors.company_address = false;
      } 

/*       if (!this.userDataPro.company_address_rest) {
        this.fieldErrors.company_address_rest = true;
        isValid = false;
      } else {
        this.fieldErrors.company_address_rest = false;
      }  */


      if (!this.userDataPro.company_city) {
        this.fieldErrors.city = true;
        isValid = false;
      } else {
        this.fieldErrors.city = false;
      } 

      if (!this.userDataPro.company_name) {
        this.fieldErrors.company_name = true;
        isValid = false;
      } else {
        this.fieldErrors.company_name = false;
      } 

      if (!this.userDataPro.company_postal_code) {
        this.fieldErrors.company_postal_code = true;
        isValid = false;
      } else {
        this.fieldErrors.company_postal_code = false;
      } 
    
      if (!this.userDataPro.contact_email) {
        this.fieldErrors.contact_email = true;
        isValid = false;
      } else {
        this.fieldErrors.contact_email = false;
      } 

      if (!this.userDataPro.contact_first_name) {
        this.fieldErrors.contact_first_name = true;
        isValid = false;
      } else {
        this.fieldErrors.contact_first_name = false;
      } 

      if (!this.userDataPro.contact_last_name) {
        this.fieldErrors.contact_last_name = true;
        isValid = false;
      } else {
        this.fieldErrors.contact_last_name = false;
      } 

      if (!this.userDataPro.ice) {
        this.fieldErrors.ice = true;
        isValid = false;
      } else {
        this.fieldErrors.ice = false;
      } 
    }
    // Additional checks for other fields...
  


    // If all fields are filled, allow to proceed to the next step
    return isValid;
  }
  
  showPassword: boolean = false;

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
  
  showRepeatPassword: boolean = false;

  toggleRepeatPasswordVisibility(): void {
    this.showRepeatPassword = !this.showRepeatPassword;
  }
  
  

  visible:boolean = true;
  changetype:boolean =true;
  error: any; 
  viewpass(){
    this.visible = !this.visible;
    this.changetype = !this.changetype;
  }
  
  clearError(fieldName: string): void {
    this.fieldErrors[fieldName] = false;
  }
   userDatas : any;

   validateFormPassword():boolean{

    let isValid =true;
    if(this.userData.password === "" ){
      this.fieldErrors.password=true;
      isValid=false;
    }else{
      this.fieldErrors.password=false;
    }

    if(this.userData.repeat_password === "" ){
      this.fieldErrors.repeat_password=true;
      isValid=false;
    }else{
      this.fieldErrors.repeat_password=false;
    }
    if (!this.fieldErrors.password && !this.fieldErrors.repeat_password) {
      if (this.userData.password !== this.userData.repeat_password) {
        this.fieldErrors.passwordMismatch = true;
        isValid = false;
      } else {
        this.fieldErrors.passwordMismatch = false;
      }
    } else {
      this.fieldErrors.passwordMismatch = false;
    }

    return isValid;
   }
   
   onPassword(): void {
   if(this.validateFormPassword()){
    this.userDataPassword.password=this.userData.password;
    this.userDataPassword.uuid=this.userData.uuid;
    this.userDataPassword.repeat_password =this.userData.repeat_password;

    this.userService.updateUser(this.userId!,this.accessToken!,this.userDataPassword).subscribe((data)=>{
    window.location.href = '/page-account'; // Redirect to login page

    },(error)=>{
      console.error('Failed to password user', error);

    })
   }
       
   }

  onSubmit(): void {
    if (this.validateForm()) {
     

      if (this.selectedOption == 'Monsieur') {
        this.userData.civility = 'Mr';
      } else {
        this.userData.civility = 'Mrs';
      }
     let isValid = true;
     if (this.selectedOption == 'Monsieur') {
      this.userData.civility = 'Mr';
    } else {
      this.userData.civility = 'Mrs';
    }
    const {
      password,
      repeat_password,
      ...userData
      
    } = this.userData;
    this.userDatas = userData;

      if (this.userData.password === "" && this.userData.repeat_password === "") {
        const {
          password,
          repeat_password,
          ...userData
        } = this.userData;
        this.userDatas = userData;


      }else{
        this.userDatas =this.userData;
        if(this.userData.password === "" ){
          this.fieldErrors.password=true;
          isValid=false;
        }else{
          this.fieldErrors.password=false;
        }

        if(this.userData.repeat_password === "" ){
          this.fieldErrors.repeat_password=true;
          isValid=false;
        }else{
          this.fieldErrors.repeat_password=false;
        }
        if (!this.fieldErrors.password && !this.fieldErrors.repeat_password) {
          if (this.userData.password !== this.userData.repeat_password) {
            this.fieldErrors.passwordMismatch = true;
            isValid = false;
          } else {
            this.fieldErrors.passwordMismatch = false;
          }
        } else {
          this.fieldErrors.passwordMismatch = false;
        }
      }

      // Remove unwanted fields from userData before sending it to the service
      const {
        generatedSecurityCode,
        enteredSecurityCode,
        termsAccepted,
        ...userDataToSend
      } = this.userDatas;


      const userId = localStorage.getItem('loggedInUserId');
      const accessToken = localStorage.getItem('loggedInUserToken');
 
     if (this.showProfessionalAccount) {
        

        this.userService.updateUser(userId!,accessToken!,this.userDatas).subscribe(
          (data) => {
            this.userService.updateUserPro(this.idPro!,accessToken!,this.userDataPro).subscribe((data)=>{
              //this.location.reload();
            },(error) =>{
              console.error('Failed to register user', error);
            }
            )

            // Handle successful registration
            window.location.href = '/page-account'; // Redirect to login page
          },
          (error) => {
            this.error = error; 
            // Handle registration error
            console.error('Failed to register user', error);
          }
        );
      } else {
        const { professional, ...userDataToSend } = this.userDatas;

        this.userService.updateUser(this.userId!,this.accessToken!,userDataToSend).subscribe(
          (data) => {

            // Handle successful registration
            //this.location.reload();
            window.location.href = '/page-account'; // Redirect to login page

          },
          (error) => {
            // Handle registration error
            this.error = error; 
          }
        );
      } 



    }

    // Call your service to register the user with userDataToSend
  }

  updateSecurityCode(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement) {
      this.userData.enteredSecurityCode = inputElement.value;
    }
  }

  resetForm(): void {
    // Generate a new security code and reset the form
    this.userData.generatedSecurityCode = this.generateSecurityCode();
    // Reset other form fields as needed
    // this.userData = { ... }; // Reset other form fields if needed
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

}
