import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
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
