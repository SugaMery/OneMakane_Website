import { Injectable, Inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private currentLanguage: string;

  constructor(
    private translate: TranslateService,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.currentLanguage = localStorage.getItem('chosenLanguage') || 'fr';
    this.setLanguage(this.currentLanguage, false);
  }

  setLanguage(language: string, reload: boolean = true) {
    this.currentLanguage = language;
    localStorage.setItem('chosenLanguage', language);
    this.translate.use(language);
    if (reload) {
      this.document.location.reload();
    }
    this.updateDirection(language);
  }

  getCurrentLanguage() {
    return this.currentLanguage;
  }

  private updateDirection(language: string) {
    if (language === 'ar') {
      this.document.documentElement.setAttribute('dir', 'rtl');
    } else {
      this.document.documentElement.setAttribute('dir', 'ltr');
    }
  }
}
