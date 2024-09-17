import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-payment-success',
  templateUrl: './payment-success.component.html',
  styleUrls: ['./payment-success.component.css']
})
export class PaymentSuccessComponent implements OnInit {

  ngOnInit(): void {
    // Remove the payment data from localStorage on successful payment
    this.clearPaymentData();
  }

  clearPaymentData(): void {
    localStorage.removeItem('paymentData');
    console.log('Payment data removed from localStorage.');
  }
}
