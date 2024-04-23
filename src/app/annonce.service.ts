import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AnnonceService {
  //   filterAdsByTitle(ads: any[], title: string) {
  //     const listAds = [];
  //     if (title && ads) {
  //         const normalizedTitle = this.normalizeString(title);
  //         const titleWords = normalizedTitle.split(" ");

  //         for (let ad of ads) {
  //             const normalizedAdTitle = this.normalizeString(ad.title);
  //             let allWordsIncluded = true;

  //             for (let word of titleWords) {
  //               console.log("word",word,normalizedAdTitle,normalizedAdTitle.includes(word));
  //                 if (!normalizedAdTitle.includes(word)) {
  //                     allWordsIncluded = false;
  //                     break;
  //                 }else{
  //                   listAds.push(ad);

  //                 }
  //             }

  //         }

  //         return listAds;
  //     } else {
  //         return ads;
  //     }
  // }

  // normalizeString(str: string) {
  //     return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  // }

  private apiUrl = 'https://devapi.onemakan.com/v1';
  private headers = new HttpHeaders();

  constructor(private http: HttpClient) {
    this.headers = this.headers.set('Content-Type', 'application/json');
  }

  private getHeaders(accessToken: string): HttpHeaders {
    return this.headers.set('Authorization', `Bearer ${accessToken}`);
  }

  createAnnonce(annonceData: any, accessToken: string): Observable<any> {
    const url = `${this.apiUrl}/ads`;
    return this.http.post<any>(url, annonceData, {
      headers: this.getHeaders(accessToken),
    });
  }

  uploadImages(mediaData: any, accessToken: string): Observable<any> {
    const url = `${this.apiUrl}/medias`;
    return this.http.post<any>(url, mediaData, {
      headers: this.getHeaders(accessToken),
    });
  }

  uploadFile(file: File, accessToken: string): Promise<any> {
    const url = `${this.apiUrl}/medias`;
    const formData = new FormData();
    formData.append('media_file', file);
    return this.http
      .post<any>(url, formData, { headers: this.getHeaders(accessToken) })
      .toPromise();
  }

  getAds(accessToken: string): Observable<any> {
    const url = `${this.apiUrl}/ads`;
    return this.http.get<any>(url, { headers: this.getHeaders(accessToken) });
  }

  getAdById(adId: string, accessToken: string): Observable<any> {
    const url = `${this.apiUrl}/ads/${adId}`;
    return this.http.get<any>(url, { headers: this.getHeaders(accessToken) });
  }

  insertSetting(
    adId: string,
    categoryModel: string,
    setting: any,
    accessToken: string
  ): Observable<any> {
    const url = `${this.apiUrl}/ads/${adId}/${categoryModel}`;
    return this.http.post<any>(url, setting, {
      headers: this.getHeaders(accessToken),
    });
  }
}