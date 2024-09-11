import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OptionsService {
  private baseUrl = 'https://api.onemakan.com/v1';

  constructor(private http: HttpClient) {}

  getPaidOptions(accessToken: string, type?: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });

    // Construct the URL with query parameters
    const url = type
      ? `${this.baseUrl}/paid-options?type=${type}`
      : `${this.baseUrl}/paid-options`;

    // Make the HTTP GET request
    return this.http.get<any>(url, { headers });
  }
}
