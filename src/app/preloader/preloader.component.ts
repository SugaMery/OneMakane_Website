import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-preloader',
  templateUrl: './preloader.component.html',
  styleUrls: ['./preloader.component.css'],
})
export class PreloaderComponent implements OnInit {
  constructor(@Inject(PLATFORM_ID) private platformId: any) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Use window.onload to ensure all resources are loaded
      window.onload = () => {
        setTimeout(() => {
          this.hidePreloader();
        }, 450); // Adjust delay as needed
      };

      // Fallback for iOS devices in case window.onload doesn't work
      // iOS sometimes doesn't fire window.onload correctly
      setTimeout(() => {
        this.hidePreloader();
      }, 3000); // Adjust timeout as needed
    }
  }

  hidePreloader(): void {
    if (isPlatformBrowser(this.platformId)) {
      const preloader = document.getElementById('preloader-active');
      if (preloader) {
        preloader.style.display = 'none';
      }
      document.body.style.overflow = 'visible';

      const modal = document.getElementById('onloadModal');
      if (modal) {
        // Assuming you are using Bootstrap modal
        // If not, replace this with appropriate code to show your modal
        (window as any).$('#onloadModal').modal('show');
      }
    }
  }
}
