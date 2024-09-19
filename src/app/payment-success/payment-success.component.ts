import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-payment-success',
  templateUrl: './payment-success.component.html',
  styleUrls: ['./payment-success.component.css'],
})
export class PaymentSuccessComponent implements OnInit {
  public oid: string | null = null;

  ngOnInit(): void {
    // Remove the payment data from localStorage on successful payment
    this.clearPaymentData();
    // Retrieve and display the 'oid' value
    this.retrieveOid();
  }

  clearPaymentData(): void {
    localStorage.removeItem('paymentData');
    console.log('Payment data removed from localStorage.');
  }

  retrieveOid(): void {
    // Parse the query string to get the 'oid' parameter
    const urlParams = new URLSearchParams(window.location.search);
    this.oid = urlParams.get('oid');
    console.log('OID:', this.oid);
  }
}
