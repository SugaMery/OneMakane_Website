import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PaymentService } from '../payment.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-payment-faild',
  templateUrl: './payment-faild.component.html',
  styleUrls: ['./payment-faild.component.css'],
})
export class PaymentFaildComponent {
  transactionResult: any = {};
  errorMessage: string = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['transactionId']) {
        this.transactionResult = {
          transactionId: params['transactionId'],
          status: params['status'],
          message: params['message'],
          date: new Date(params['date']), // Make sure to parse it correctly
        };
        console.log('correctly params', params);
      } else {
        this.errorMessage = 'No transaction data available.';
      }
    });
  }
}
