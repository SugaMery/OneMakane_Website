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
  currentIndex: number | undefined; // Initialize as undefined
  responsiveOptions:
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
        numScroll: 2,
      },
    ];

    if (this.document.defaultView && this.document.defaultView.localStorage) {
      const accessToken =
        this.document.defaultView.localStorage.getItem('loggedInUserToken');
      if (accessToken) {
        this.annonceService.getAds(accessToken!).subscribe((data) => {
          data.data.forEach((element: any) => {
            this.annonceService
              .getAdById(element.id, accessToken!)
              .subscribe((data) => {
                element.image = data.data.image;
                this.ads.push(data.data);
                console.log('rrrrrrrrrrrrrrrrr', this.ads);
              });
          });
        });
      }
    }
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
            console.log('Souscategories:', this.Souscategories);

            // Check if the first element of Souscategories has the media property
            if (
              this.Souscategories &&
              this.Souscategories.length > 0 &&
              this.Souscategories[0].media
            ) {
              // Add console log to check if the media property exists
              console.log('Media object:', this.Souscategories[0].media);

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
    console.log('Souscategories ', this.Souscategories);
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
