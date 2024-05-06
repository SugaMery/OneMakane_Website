import { Component, Inject, OnInit } from '@angular/core';
import { CategoryService } from '../category.service';
import { DOCUMENT } from '@angular/common';
import { AnnonceService } from '../annonce.service';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css',
})
export class HomePageComponent implements OnInit {
  categories: any[] = [];
  Souscategories: any[] = [];
  displayedCategories: any[] = [];
  hiddenCategories: any[] = [];
  showMore: boolean = false;
  ads: any[] = [];

  firstad :any ={};
  adsArray: any[] = [];
  categorizedAds: {[key: string]: any[]} = {}; // Define categorizedAds property
  currentIndex: number | undefined; // Initialize as undefined
  responsiveOptions:
    | { breakpoint: string; numVisible: number; numScroll: number }[]
    | undefined;
    responsiveOptions2:
    | { breakpoint: string; numVisible: number; numScroll: number }[]
    | undefined;
  constructor(
    private categoryService: CategoryService,
    private annonceService: AnnonceService,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit(): void {
    this.getCategories();
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
    this.responsiveOptions2 = [
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

    if (this.document.defaultView && this.document.defaultView.localStorage) {
      const accessToken = this.document.defaultView.localStorage.getItem('loggedInUserToken');
      if (accessToken) {
        this.annonceService.getAds(accessToken!).subscribe((data) => {
          this.ads=data.data;
          this.annonceService.getAdById(data.data[0].id, accessToken!).subscribe((data) =>{
            this.firstad=data.data; 
            console.log("tttttttttt",data.data)
          }
          )
     
      
          const categorizedAds: {[key: string]: any[]} = {}; // Object to hold ads grouped by category
          data.data.forEach((element: any) => {
            this.annonceService.getAdById(element.id, accessToken!).subscribe((data) => {
              element.image = data.data.image;
              
              if (!categorizedAds[element.category.name]) {
                categorizedAds[element.category.name] = []; // Initialize array if category doesn't exist
              }
              categorizedAds[element.category.name].push(data.data); // Push ad to respective category
              console.log('Categorized Ads:', categorizedAds);

            });
          });
    
          // Now categorizedAds object holds ads grouped by category
          console.log('Categorized Ads:', categorizedAds);
          this.categorizedAds = categorizedAds; // Assign categorizedAds to a component property for use in HTML
        });
      }
    }
    this.convertAdsToArray();
    
  }



  convertAdsToArray() {
    this.adsArray = Object.values(this.categorizedAds);
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

  getCategories(): void {
    if (this.document.defaultView && this.document.defaultView.localStorage) {
      const accessToken =
        this.document.defaultView.localStorage.getItem('loggedInUserToken');
      if (accessToken) {
        this.categoryService
          .getCategoriesFrom(accessToken!)
          .subscribe((categories) => {
            this.categories = categories.data.filter(
              (category: { active: boolean; parent_id: null }) =>
                category.active === true && category.parent_id === null
            );
            this.Souscategories = categories.data.filter(
              (category: { active: boolean; parent_id: null }) =>
                category.active === true && category.parent_id !== null
            );

            // Check if the first element of Souscategories has the media property
            if (
              this.Souscategories &&
              this.Souscategories.length > 0 &&
              this.Souscategories[0].media
            ) {
              // Add console log to check if the media property exists

              // Check if the media object has the url property
              if (this.Souscategories[0].media.url) {
                // Log the URL to the console
                console.log(
                  'Souscategories 2 URL:',
                  this.Souscategories[0].media.url
                );
              } else {
                console.log('URL property does not exist in media object');
              }
            } else {
              console.log(
                'Media property or Souscategories array does not exist or is empty'
              );
            }
            this.displayedCategories = this.categories.slice(0, 11);
            this.hiddenCategories = this.categories.slice(11);
          });
      }
    }
  }

  toggleShowMore(): void {
    this.showMore = !this.showMore;
  }
  colors = ['bg-9', 'bg-10', 'bg-11', 'bg-12', 'bg-13', 'bg-14', 'bg-15']; // Define your colors here

  calculateBgColor(category: any, categories: any[]): string {
    const index = categories.indexOf(category);
    return this.colors[index % this.colors.length];
  }

  
}
