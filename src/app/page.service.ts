// page.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PageService {
  private apiUrl = 'https://devapi.onemakan.com/v1/pages';
  //getPageBySlug: any;

  constructor(private http: HttpClient) {}

  getPage(pageId: string, langId: string): Observable<any> {
    const url = `${this.apiUrl}/${pageId}/${langId}`;
    return this.http.get(url);
  }
  getPageBySlug(slug: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/pages?slug=${slug}`);
  }
}
