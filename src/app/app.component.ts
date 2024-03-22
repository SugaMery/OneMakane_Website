import { Component, OnInit, Renderer2, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'OneMakan_Website';

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadScripts([
        "assets/js/vendor/modernizr-3.6.0.min.js",
        "assets/js/vendor/jquery-3.6.0.min.js",
        "assets/js/vendor/jquery-migrate-3.3.0.min.js",
        "assets/js/vendor/bootstrap.bundle.min.js",
        "assets/js/plugins/slick.js",
        "assets/js/plugins/jquery.syotimer.min.js",
        "assets/js/plugins/waypoints.js",
        "assets/js/plugins/wow.js",
        "/assets/js/plugins/perfect-scrollbar.js",
        "assets/js/plugins/magnific-popup.js",
        "assets/js/plugins/select2.min.js",
        "assets/js/plugins/counterup.js",
        "assets/js/plugins/jquery.countdown.min.js",
        "assets/js/plugins/images-loaded.js",
        "assets/js/plugins/isotope.js",
        "assets/js/plugins/scrollup.js",
        "assets/js/plugins/jquery.vticker-min.js",
        "assets/js/plugins/jquery.theia.sticky.js",
        "assets/js/plugins/jquery.elevatezoom.js",
        "assets/js/main.js",
        "assets/js/shop.js"

      ]);
    }
  }

  private loadScripts(scriptUrls: string[]): void {
    scriptUrls.forEach(scriptUrl => {
      const script = document.createElement('script');
      script.src = scriptUrl;
      script.async = false; // Ensure scripts are loaded in order
      document.body.appendChild(script);
    });
  }




}
