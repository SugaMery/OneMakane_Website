import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

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
}
