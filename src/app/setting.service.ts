import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SettingService {
  private apiUrl = 'https://api.onemakan.com/v1/settings';

  constructor(private http: HttpClient) {}

  getSettings(accessToken: string, queryParams?: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });

    const options = {
      params: queryParams,
    };
    return this.http.get(this.apiUrl, options);
  }

  private devApiUrl = 'https://api.onemakan.com/v1';

  createMarque(route: string, accessToken: string): Observable<any> {
    const url = `${this.devApiUrl}/${route}`;

    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });

    return this.http.get(url, { headers });
  }
}
