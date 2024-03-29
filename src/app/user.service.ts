import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = 'https://devapi.onemakan.com/v1';

  constructor(private http: HttpClient) { }

  registerUser(userDetails: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/users`, userDetails);
  }

  login(userDetails : any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/login`, userDetails);
  }

  getUserInfoById(userId: number, accessToken: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`
    });

    return this.http.get(`${this.baseUrl}/users/${userId}`, { headers });
  }


}
