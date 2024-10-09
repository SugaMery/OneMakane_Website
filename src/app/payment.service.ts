import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpResponse,
} from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private apiUrl = 'https://dev.onemakan.ma/payment/failed/';

  constructor(private http: HttpClient) {}

  postPaymentData(data: any) {
    return this.http
      .post(this.apiUrl, data, { observe: 'response' })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    // Gérez l'erreur ici
    return throwError('Une erreur est survenue; veuillez réessayer plus tard.');
  }

  private apiUrls = 'https://devapi.onemakan.com/v1/payments';

  // Function to get the headers with Authorization token
  private getHeaders(accessToken: string): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`, // Sending Bearer Token in header
    });
  }

  // Method to update the payment data
  updatePayment(
    paymentId: string,
    updateData: any,
    accessToken: string
  ): Observable<any> {
    const url = `${this.apiUrls}/${paymentId}`; // URL with payment ID
    return this.http.put<any>(url, updateData, {
      headers: this.getHeaders(accessToken),
    });
  }
  private paymentFailedUrl = 'https://dev.onemakan.ma/payment/failed/'; // Your backend URL

  getFailedTransactionData(): Observable<HttpResponse<any>> {
    return this.http.get(this.paymentFailedUrl, { observe: 'response' });
  }

  private failedPaymentUrl = 'https://dev.onemakan.ma/payment/failed/'; // Adjust as needed

  getFailedPaymentData(): Observable<any> {
    return this.http
      .post(this.failedPaymentUrl, {}, { responseType: 'text' })
      .pipe(
        map((response) => {
          try {
            return JSON.parse(response); // Attempt to parse as JSON
          } catch {
            return response; // Return raw response if JSON parsing fails
          }
        })
      );
  }
}
