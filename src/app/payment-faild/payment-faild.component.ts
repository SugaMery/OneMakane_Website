import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-payment-faild',
  templateUrl: './payment-faild.component.html',
  styleUrls: ['./payment-faild.component.css'],
})
export class PaymentFaildComponent implements OnInit {
  transactionResult: any = {};
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private httpClient: HttpClient
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const sessionId = params['sessionId'];

      if (sessionId) {
        console.log('Using session ID to fetch data:', sessionId);

        // Fetch sensitive data using the session ID
        this.httpClient
          .get(`https://api.onemakan.ma/payment/data/${sessionId}`, {
            withCredentials: true,
          })
          .subscribe(
            (data) => {
              this.transactionResult = data;
              console.log('Received Data from server:', this.transactionResult);
            },
            (error) => {
              this.errorMessage = 'Failed to retrieve transaction data.';
              console.error('Error fetching data:', error);
            }
          );
      } else {
        console.error('No session ID found in query params.');
      }
    });
  }
}
