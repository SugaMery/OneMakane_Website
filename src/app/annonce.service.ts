import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AnnonceService {

  private apiUrl = 'https://devapi.onemakan.com/v1/ads';

  constructor(private http: HttpClient) {}

  createAnnonce(annonceData: any, accessToken: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`
    });
    return this.http.post<any>(this.apiUrl, annonceData ,{ headers });
  }

  uploadImages(mediaData: any , accessToken: string): Observable<any> {
    const mediaUrl = 'https://devapi.onemakan.com/v1/medias';
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`
    });
    return this.http.post<any>(mediaUrl, mediaData ,{ headers } );
  }  


  uploadFile(file: File, accessToken: string): Promise<any> {
    const formData = new FormData();
    formData.append('media_file', file);

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`
    });

    return this.http.post<any>('https://devapi.onemakan.com/v1/medias', formData, { headers }).toPromise();
  }


  getAds(accessToken: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`
    });

    return this.http.get('https://devapi.onemakan.com/v1/ads', { headers });
  }
  private baseUrl = 'https://devapi.onemakan.com/v1';

  getAdById(adId: string, accessToken: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`
    });
  
    return this.http.get(`${this.baseUrl}/ads/${adId}`, { headers });
  }
  
  private apiurl = 'https://devapi.onemakan.com/v1/ads'; // Update with your API URL


  insertStateAndGenre(adId: string, category: string, state: string, genre: string, accessToken: string): Observable<any> {
    const url = `${this.apiUrl}/${adId}/${category}`;
    const body = { state: state, genre: genre };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    });

    return this.http.post(url, body, { headers });
  }
}
