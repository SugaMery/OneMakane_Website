import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OptionsService {
  private baseUrl = 'https://devapi.onemakan.com/v1';

  constructor(private http: HttpClient) {}

  getPaidOptions(accessToken: string, type?: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });

    // Construct the URL with query parameters
    const url = type
      ? `${this.baseUrl}/paid-options?type=${type}`
      : `${this.baseUrl}/paid-options`;

    // Make the HTTP GET request
    return this.http.get<any>(url, { headers });
  }

  postOrder(
    accessToken: string,
    userId: number,
    adId: number
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    });

    const body = {
      user_id: userId,
      ad_id: adId,
    };

    const url = `${this.baseUrl}/orders`;

    return this.http.post<any>(url, body, { headers });
  }

  postOrderItem(
    accessToken: string,
    orderId: number,
    paidOptionId: number
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    });

    const body = {
      order_id: orderId,
      paid_option_id: paidOptionId,
    };

    const url = `${this.baseUrl}/order-items`;

    return this.http.post<any>(url, body, { headers });
  }

  // New method to post payment details
  postPayment(paymentData: any, accessToken: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    });

    const url = `${this.baseUrl}/payments`;
    return this.http.post<any>(url, paymentData, { headers });
  }

  // New method to update payment details
  updatePayment(
    paymentId: number,
    accessToken: string,
    data: any
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    });

    const url = `${this.baseUrl}/payments/${paymentId}`;
    return this.http.patch<any>(url, data, { headers });
  }

  getPaymentById(id: number, accessToken: string): Observable<any> {
    const headers = { Authorization: `Bearer ${accessToken}` };
    return this.http.get<any>(`${this.baseUrl}/payments/${id}`, { headers });
  }
}
