import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { forkJoin, Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
interface Category {
  id: string;
  name: string;
  children?: Category[];
}

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private apiUrl = 'http://localhost:3000/categories';
  private devApiUrl = 'https://devapi.onemakan.com/v1';
  private headers = new HttpHeaders();

  constructor(private http: HttpClient) {
    this.headers = this.headers.set('Content-Type', 'application/json');
  }

  private getHeaders(accessToken: string): HttpHeaders {
    return this.headers.set('Authorization', `Bearer ${accessToken}`);
  }

  getAdsByCategory(categoryId: number, params: any): Observable<any> {
    // Construct the URL with categoryId and additional params
    let url = `${this.devApiUrl}/categories/${categoryId}/ads`;

    // Append query parameters if there are any
    if (params) {
      url += '?' + this.serializeParams(params);
    }

    // Make the HTTP GET request
    return this.http.get(url);
  }

  getAdsByCategorys(categoryId: number): Observable<any> {
    // Construct the URL with categoryId and additional params
    let url = `${this.devApiUrl}/categories/${categoryId}/ads`;

    // Append query parameters if there are any
    // Make the HTTP GET request
    return this.http.get(url);
  }
  // Helper function to serialize parameters
  private serializeParams(params: any): string {
    return Object.keys(params)
      .map(
        (key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
      )
      .join('&');
  }

  getCategoriesFrom(): Observable<any> {
    const headers = new HttpHeaders({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    });
    return this.http.get<any>(`${this.devApiUrl}/categories`, { headers });
  }

  getCategories(params: any): Observable<any> {
    const headers = new HttpHeaders({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    });

    let httpParams = new HttpParams();
    for (const key in params) {
      if (params.hasOwnProperty(key)) {
        httpParams = httpParams.set(key, params[key]);
      }
    }

    return this.http.get<any>(`${this.devApiUrl}/categories`, {
      headers,
      params: httpParams,
    });
  }
  getAdsWithFavoris(
    user_id: number,
    categoryId: number,
    page: number = 1
  ): Observable<any> {
    const url = `${this.devApiUrl}/categories/${categoryId}/ads?user_id=${user_id}&page=${page}`;
    return this.http.get<any>(url);
  }

  getAllAdsWithFavoris(user_id: number, categoryId: number): Observable<any[]> {
    return this.getAdsWithFavoris(user_id, categoryId).pipe(
      switchMap((response) => {
        const totalPages = response.pagination.total_page;
        const requests: Observable<any>[] = [];

        // Push the first page response
        requests.push(of(response));

        // Create requests for all other pages
        for (let page = 2; page <= totalPages; page++) {
          requests.push(this.getAdsWithFavoris(user_id, categoryId, page));
        }

        // Execute all requests and combine results
        return forkJoin(requests).pipe(
          map((responses) => responses.flatMap((res) => res.data))
        );
      })
    );
  }
  getCategoryById(categoryId: string): Observable<any> {
    const url = `${this.devApiUrl}/categories/${categoryId}`;
    return this.http.get(url);
  }

  private handleError(error: any): Observable<never> {
    console.error('An error occurred:', error);
    return throwError('Something went wrong');
  }

  getCategoryTree(): Observable<Category[]> {
    return this.http
      .get<{ status: string; message: string; data: any }>(
        `${this.devApiUrl}/categories/tree-list`
      )
      .pipe(
        map((response) => {
          if (response.status === 'Success') {
            return this.transformCategories(response.data);
          }
          return [];
        })
      );
  }

  private transformCategories(data: any): Category[] {
    const categories: Category[] = [];
    let currentParent: Category | null = null;

    Object.keys(data).forEach((key) => {
      const value = data[key];
      if (!value.startsWith('- ')) {
        // New parent category
        currentParent = {
          id: key,
          name: value,
          children: [],
        };
        categories.push(currentParent);
      } else if (currentParent) {
        // Child category
        currentParent.children!.push({
          id: key,
          name: value.replace('- ', ''),
        });
      }
    });

    return categories;
  }
}
