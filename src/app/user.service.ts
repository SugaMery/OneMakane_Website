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
  getAllUsers( accessToken: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`
    });
    return this.http.get<any>(`${this.baseUrl}/users`, { headers });
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
  sendResetEmail(email: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/auth/lost-password`, { email });
  }

  resetPassword(user_id: string, password_token: string, new_password: string, new_repeatpassword: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/auth/reset-password`, { user_id, password_token, new_password, new_repeatpassword });
  }

  updateUser(userId: string,accessToken: string, userData: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`
    });

    return this.http.patch<any>(`${this.baseUrl}/users/${userId}`, userData,{ headers });
  }

  updateUserPro(userId: string,accessToken: string, userData: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`
    });

    return this.http.patch<any>(`${this.baseUrl}/professionals/${userId}`, userData,{ headers });
  }
}
