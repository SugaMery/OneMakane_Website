import { Component, Inject, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AnnonceService } from '../annonce.service';
import { DOCUMENT } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-ads-detail',
  templateUrl: './ads-detail.component.html',
  styleUrl: './ads-detail.component.css',
})
export class AdsDetailComponent {
  adId: string = '';
  adDetail: any = [];
  constructor(
    private route: ActivatedRoute,
    private annonceService: AnnonceService,
    @Inject(DOCUMENT) private document: Document,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
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
            this.annonceService
              .getAdById(this.adId, accessToken!)
              .subscribe((data) => {
                this.adDetail = data.data;
                console.log('datarrr', data);
              });
          }
        }
        // Utilisez maintenant this.adId pour obtenir l'ID de l'annonce
      }
    });
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
  getMapUrl(city: string): SafeResourceUrl {
    const apiKey = 'AIzaSyAgd5AQZWYpCZYv9S0WEnQLGGu1dardz_s';
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.google.com/maps/embed/v1/place?q=${city}&key=${apiKey}`
    );
  }
}
