import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private baseUrl = 'https://devapi.onemakan.com/v1';

  constructor(private http: HttpClient) {}

  registerUser(userDetails: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/users`, userDetails);
  }
  getAllUsers(accessToken: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });
    return this.http.get<any>(`${this.baseUrl}/users`, { headers });
  }

  getUserInfoById(userId: number, accessToken: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });

    return this.http.get(`${this.baseUrl}/users/${userId}`, { headers });
  }

  private apiUrl = 'https://devapi.onemakan.com/v1';
  login(userData: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, userData);
  }

  refreshToken(refreshToken: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/refresh-token`, {
      refreshToken,
    });
  }

  logout(token: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/logout`, { token });
  }

  isTokenExpired(token: string): boolean {
    // Décodez et vérifiez l'expiration du token JWT
    const payload = JSON.parse(atob(token.split('.')[1]));
    return Math.floor(new Date().getTime() / 1000) >= payload.exp;
  }

  getUserInfoByIdVendor(
    userId: number,
    uuid: string,
    accessToken: string
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });

    return this.http.get(`${this.baseUrl}/users/profile/${userId}/${uuid}`, {
      headers,
    });
  }

  getConversationsByUser(userId: number, accessToken: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });

    return this.http.get(`${this.baseUrl}/users/${userId}/conversations`, {
      headers,
    });
  }

  sendResetEmail(email: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/auth/lost-password`, { email });
  }

  resetPassword(
    user_id: string,
    password_token: string,
    new_password: string,
    new_repeatpassword: string
  ): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/auth/reset-password`, {
      user_id,
      password_token,
      new_password,
      new_repeatpassword,
    });
  }

  activateAccount(userId: string, activationToken: string): Observable<any> {
    return this.http.patch(
      `${this.baseUrl}/auth/account-activation/${userId}/${activationToken}`,
      {}
    );
  }

  updateUser(
    userId: string,
    accessToken: string,
    userData: any
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });

    return this.http.patch<any>(`${this.baseUrl}/users/${userId}`, userData, {
      headers,
    });
  }

  updateUserPro(
    userId: string,
    accessToken: string,
    userData: any
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });

    return this.http.patch<any>(
      `${this.baseUrl}/professionals/${userId}`,
      userData,
      { headers }
    );
  }
  getJobApplicationsByUser(
    userId: number,
    accessToken: string
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });

    return this.http.get<any>(
      `${this.baseUrl}/users/${userId}/job-appliances`,
      { headers }
    );
  }
}
