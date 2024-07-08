import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-google-map',
  template: `
    <div #mapElement class="google-map"></div>
  `,
  styleUrls: ['./google-map.component.css']
})
export class GoogleMapComponent implements OnInit {
  @Input() postal_code!: string;

  map!: google.maps.Map;
  rectangle!: google.maps.Rectangle;

  constructor() { }

  ngOnInit(): void {
    this.initMap();
  }

  initMap(): void {
    const geocoder = new google.maps.Geocoder();
    const mapElement = document.getElementById('mapElement') as HTMLDivElement;

    const mapOptions: google.maps.MapOptions = {
      center: { lat: 31.6295, lng: -7.9811 }, // Default center on Marrakech, Morocco
      zoom: 12,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    this.map = new google.maps.Map(mapElement, mapOptions);

    if (this.postal_code) {
      geocoder.geocode({ address: this.postal_code + ', Morocco' }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const location = results[0].geometry.location;
          const bounds = results[0].geometry.bounds || results[0].geometry.viewport;

          if (this.rectangle) {
            this.rectangle.setMap(null); // Remove previous rectangle
          }

          this.rectangle = new google.maps.Rectangle({
            bounds: bounds,
            map: this.map,
            strokeColor: '#FF0000',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#00FF00', // Green fill color
            fillOpacity: 0.35
          });

          this.map.fitBounds(bounds); // Fit map to postal code bounds
          this.map.setCenter(location); // Center map on the new location
        } else {
          console.error('Geocode was not successful for the following reason: ' + status);
        }
      });
    }
  }
}
