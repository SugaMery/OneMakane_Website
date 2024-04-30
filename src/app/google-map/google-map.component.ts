import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-google-map',
  templateUrl: './google-map.component.html',
  styleUrls: ['./google-map.component.css'],
})
export class GoogleMapComponent implements OnInit {
  @Input() city: string | undefined;
  mapUrl: SafeResourceUrl | undefined;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.updateMapUrl();
  }

  ngOnChanges(): void {
    this.updateMapUrl();
  }

  updateMapUrl(): void {
    const mapUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d6944536.185077172!2d-7.150687899999999!3d31.800834649999995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd0b88619651c58d%3A0xd9d39381c42cffc3!2s${this.city}!5e0!3m2!1sfr!2sma!4v1714471864538!5m2!1sfr!2sma`;
    this.mapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(mapUrl);
  }
}
