import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

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

  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(catchError(this.handleError));
  }

  getCategoriesFrom(accessToken: string): Observable<any> {
    const url = `${this.devApiUrl}/categories`;
    return this.http
      .get<any[]>(url, { headers: this.getHeaders(accessToken) })
      .pipe(catchError(this.handleError));
  }

  getCategoriesFromHere(): Observable<any> {
    const url = `${this.devApiUrl}/categories`;

    // Check if localStorage is available before using it
    const accessToken = localStorage
      ? localStorage.getItem('loggedInUserToken')
      : null;

    if (!accessToken) {
      // Handle the case when localStorage is not available or token is not found
      // For example, you can redirect to the login page or display an error message
      // Here, I'm just throwing an error for demonstration purposes
      return throwError('Access token not found in localStorage');
    }

    return this.http
      .get<any[]>(url, { headers: this.getHeaders(accessToken) })
      .pipe(catchError(this.handleError));
  }
  getCategoryById(categoryId: string, accessToken: string): Observable<any> {
    const url = `${this.devApiUrl}/categories/${categoryId}`;
    return this.http.get(url, { headers: this.getHeaders(accessToken) });
  }

  private handleError(error: any): Observable<never> {
    console.error('An error occurred:', error);
    return throwError('Something went wrong');
  }
}
