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

  duplicateAnnonce(annonceData: any, accessToken: string): Observable<any> {
    const url = `${this.apiUrl}/ads/duplicate`;
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
  checkAdInJobAppliances(adIds: number[]): Observable<boolean> {
    const checkObservables = adIds.map((adId) => {
      return this.http.get(`${this.apiUrl}/ads/${adId}/job-appliances`).pipe(
        map((response: any) => {
          // Assuming the API returns a list of job appliances for the given adId
          return response.length > 0; // True if there are job appliances
        })
      );
    });

    // Combine all the observables using forkJoin and check if any of them returned true
    return forkJoin(checkObservables).pipe(
      map((results: boolean[]) => results.some((result) => result === true))
    );
  }
  uploadFile(file: File, accessToken: string): Promise<any> {
    const formData = new FormData();
    formData.append('media_file', file);
    formData.append('media_type', 'file');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });

    return this.http
      .post<any>('https://devapi.onemakan.com/v1/medias', formData, { headers })
      .toPromise();
  }

  uploadImage(file: File, accessToken: string): Promise<any> {
    const formData = new FormData();
    formData.append('media_file', file);

    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });

    return this.http
      .post<any>('https://devapi.onemakan.com/v1/medias', formData, { headers })
      .toPromise();
  }

  getJobAppliances(adId: number, accessToken: string): Observable<any> {
    const url = `${this.apiUrl}/ads/${adId}/job-appliances`;
    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });

    return this.http.get<any>(url, { headers });
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
  getAdsPromote(categoryId: number): Observable<any> {
    const url = `${this.apiUrl}/ads/go-up-ads?category_id=${categoryId}`;

    return this.http.get<any>(url); // Using GET as you only have query parameters
  }
  getAdsPromoteAll(): Observable<any> {
    const url = `${this.apiUrl}/ads/go-up-ads`;

    return this.http.get<any>(url); // Using GET as you only have query parameters
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
  getAdsValidator(
    validationStatus: string,
    searchTerm?: string,
    page: number = 1
  ): Observable<any> {
    let url = `${this.apiUrl}/ads?validation_status=${validationStatus}&page=${page}`;

    if (searchTerm) {
      url += `&search_term=${encodeURIComponent(searchTerm)}`;
    }

    return this.http.get<any>(url);
  }

  getAllAdsValidator(
    validationStatus: string,
    searchTerm?: string
  ): Observable<any[]> {
    return this.getAdsValidator(validationStatus, searchTerm).pipe(
      switchMap((response) => {
        const totalPages = response.pagination.total_page;
        const requests: Observable<any>[] = [];

        // Push the first page response
        requests.push(of(response));

        // Create requests for all other pages
        for (let page = 2; page <= totalPages; page++) {
          requests.push(
            this.getAdsValidator(validationStatus, searchTerm, page)
          );
        }

        // Execute all requests and combine results
        return forkJoin(requests).pipe(
          map((responses) => responses.flatMap((res) => res.data))
        );
      })
    );
  }
  getJobApplianceDetails(
    jobApplianceId: number,
    accessToken: string
  ): Observable<any> {
    const url = `${this.apiUrl}/job-appliances/${jobApplianceId}`;
    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });

    return this.http.get<any>(url, { headers });
  }

  updateJobApplianceStatus(
    jobApplianceId: number,
    isSelected: boolean,
    accessToken: string
  ): Observable<any> {
    const url = `${this.apiUrl}/job-appliances/change-status/${jobApplianceId}`;
    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    });

    // Determine the status based on the selection
    const status = isSelected ? 'approved' : 'rejected';

    // Prepare the payload for the PATCH request
    const body = { status: status };

    return this.http.patch<any>(url, body, { headers });
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
