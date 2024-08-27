import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, map, Observable, of, switchMap } from 'rxjs';

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

  private apiUrl = 'https://api.onemakan.com/v1';
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
    const formData = new FormData();
    formData.append('media_file', file);
    formData.append('media_type', 'file');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });

    return this.http
      .post<any>('https://api.onemakan.com/v1/medias', formData, { headers })
      .toPromise();
  }

  getAds(): Observable<any> {
    const url = `${this.apiUrl}/ads`;
    return this.http.get<any>(url);
  }

  getAdsFirst(page: number = 1): Observable<any> {
    const url = `${this.apiUrl}/ads?page=${page}`;
    return this.http.get<any>(url);
  }

  getAllAds(): Observable<any[]> {
    return this.getAdsFirst().pipe(
      switchMap((response) => {
        const totalPages = response.pagination.total_page;
        const requests: Observable<any>[] = [];

        // Push the first page response
        requests.push(of(response));

        // Create requests for all other pages
        for (let page = 2; page <= totalPages; page++) {
          requests.push(this.getAdsFirst(page));
        }

        // Execute all requests and combine results
        return forkJoin(requests).pipe(
          map((responses) => responses.flatMap((res) => res.data))
        );
      })
    );
  }

  getAdsWithFavoris(user_id: number, page: number = 1): Observable<any> {
    const url = `${this.apiUrl}/ads?user_id=${user_id}&page=${page}`;
    return this.http.get<any>(url);
  }

  getAllAdsWithFavoris(user_id: number): Observable<any[]> {
    return this.getAdsWithFavoris(user_id).pipe(
      switchMap((response) => {
        const totalPages = response.pagination.total_page;
        const requests: Observable<any>[] = [];

        // Push the first page response
        requests.push(of(response));

        // Create requests for all other pages
        for (let page = 2; page <= totalPages; page++) {
          requests.push(this.getAdsWithFavoris(user_id, page));
        }

        // Execute all requests and combine results
        return forkJoin(requests).pipe(
          map((responses) => responses.flatMap((res) => res.data))
        );
      })
    );
  }

  getAdsWithUser(user_id: number, page: number = 1): Observable<any> {
    const url = `${this.apiUrl}/users/${user_id}/ads?page=${page}`;
    return this.http.get<any>(url);
  }

  getAllAdsWithUser(user_id: number): Observable<any[]> {
    return this.getAdsWithUser(user_id).pipe(
      switchMap((response) => {
        const totalPages = response.pagination.total_page;
        const requests: Observable<any>[] = [];

        // Push the first page response
        requests.push(of(response));

        // Create requests for all other pages
        for (let page = 2; page <= totalPages; page++) {
          requests.push(this.getAdsWithUser(user_id, page));
        }

        // Execute all requests and combine results
        return forkJoin(requests).pipe(
          map((responses) => responses.flatMap((res) => res.data))
        );
      })
    );
  }

  getAdsValidator(validationStatus: string): Observable<any> {
    const url = `${this.apiUrl}/ads`;
    let params = new HttpParams().set('validation_status', validationStatus);

    return this.http.get<any>(url, { params });
  }

  getAdById(adId: string): Observable<any> {
    const url = `${this.apiUrl}/ads/${adId}`;
    return this.http.get<any>(url);
  }
  updateAnnonce(
    adId: string,
    adUuid: string,
    annonceData: any,
    accessToken: string
  ): Observable<any> {
    const url = `${this.apiUrl}/ads/${adId}/${adUuid}`;
    return this.http.patch<any>(url, annonceData, {
      headers: this.getHeaders(accessToken),
    });
  }
  CreateAdsJobs(
    adId: string,
    annonceData: any,
    accessToken: string
  ): Observable<any> {
    const url = `${this.apiUrl}/ads/${adId}/job-appliances`;
    return this.http.post<any>(url, annonceData, {
      headers: this.getHeaders(accessToken),
    });
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

  UpdateSetting(
    adId: string,
    setting: any,
    accessToken: string
  ): Observable<any> {
    const url = `${this.apiUrl}/ads/${adId}/ad-models/update`;
    return this.http.patch<any>(url, setting, {
      headers: this.getHeaders(accessToken),
    });
  }

  getDeleteReasons(accessToken: string): Observable<any> {
    const headers = this.getHeaders(accessToken);
    return this.http.get(`${this.apiUrl}/deleted-reasons`, { headers });
  }

  deleteAd(
    adId: string,
    uuid: string,
    deleteReasonId: number,
    accessToken: string
  ): Observable<any> {
    const headers = this.getHeaders(accessToken);
    return this.http.delete(`${this.apiUrl}/ads/${adId}`, {
      headers,
      body: { uuid: uuid, deleted_reason_id: deleteReasonId },
    });
  }

  addToFavorites(
    userId: number,
    adId: number,
    accessToken: string
  ): Observable<any> {
    const body = {
      user_id: userId,
      ad_id: adId,
    };
    const headers = this.getHeaders(accessToken);
    return this.http.post<any>(`${this.apiUrl}/favorites`, body, { headers });
  }

  removeFromFavorites(
    favoriteId: number,
    accessToken: string
  ): Observable<any> {
    const headers = this.getHeaders(accessToken);

    return this.http.delete<any>(`${this.apiUrl}/favorites/${favoriteId}`, {
      headers,
    }); // Adjust endpoint as needed
  }
}
