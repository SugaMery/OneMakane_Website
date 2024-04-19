import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = 'http://localhost:3000/categories'; // Update with your API URL

  constructor(private http: HttpClient) { }

  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl)
      .pipe(
        catchError(this.handleError)
      );
  }

  private handleError(error: any): Observable<never> {
    console.error('An error occurred:', error);
    return throwError('Something went wrong');
  }
  private apiUrls = 'https://devapi.onemakan.com/v1/categories'; // Update with your API URL


  getCategoriesFrom(accessToken: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`
    });

    return this.http.get(this.apiUrls, { headers })
      
  }
  private baseUrl = 'https://devapi.onemakan.com/v1';

  getCategoryById(categoryId: string, accessToken: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`
    });
  
    return this.http.get(`${this.baseUrl}/categories/${categoryId}`, { headers });
  }
}
