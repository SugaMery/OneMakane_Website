import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PaymentService } from '../payment.service';
import * as CryptoJS from 'crypto-js';
import { OptionsService } from '../options.service';

@Component({
  selector: 'app-payment-success',
  templateUrl: './payment-success.component.html',
  styleUrls: ['./payment-success.component.css'],
})
export class PaymentSuccessComponent implements OnInit {
  secretKey: string = 'your-secret-key'; // Assurez-vous que cela correspond à la clé utilisée lors de l'enregistrement
  public oid: string | null = null;
  public storageItems: { key: string; value: string }[] = [];
  transactionResult: any = {};
  errorMessage: string = '';
  today: Date = new Date(); // Set current date
  orders: any[] = [];
  constructor(
    private route: ActivatedRoute,
    private httpClient: HttpClient,
    private paymentService: PaymentService,
    private optionsService: OptionsService
  ) {}
  ngOnInit(): void {
    // Get payment data and extract the 'oid'
    const paymentData = this.getPaymentData();
    if (paymentData) {
      this.oid = paymentData.postParams['oid'];
      console.log('OID:', this.oid);
    }

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
              const accessToken = localStorage.getItem('loggedInUserToken');
              console.log(
                'testttt',
                this.transactionResult.oid,
                this.transactionResult,
                accessToken!
              );
              this.updatePayment(
                this.transactionResult.oid,
                this.transactionResult,
                accessToken!
              );
              this.optionsService
                .getOrderById(this.transactionResult.oid, accessToken!)
                .subscribe((data) => {
                  this.orders = data.data.order_items;
                });
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
    this.loadLocalStorageItems();
  }

  updatePayment(
    paymentId: string,
    transactionData: any,
    accessToken: string
  ): void {
    this.paymentService
      .updatePayment(paymentId, transactionData, accessToken)
      .subscribe(
        (response) => {
          console.log('Payment update successful:', response);
        },
        (error) => {
          console.error('Error updating payment:', error);
        }
      );
  }
  loadLocalStorageItems(): void {
    this.storageItems = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        this.storageItems.push({ key, value: value || 'null' });
      }
    }
    console.log('Storage Items:', this.storageItems);
  }
  // Method to decrypt data
  decryptData(encryptedData: string): any {
    const bytes = CryptoJS.AES.decrypt(encryptedData, this.secretKey);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  }

  // Retrieve and decrypt the payment data from localStorage
  getPaymentData(): { url: string; postParams: any } | null {
    const encryptedData = localStorage.getItem('paymentData');
    if (encryptedData) {
      return this.decryptData(encryptedData);
    }
    return null;
  }

  // Method to redirect with POST
  redirectToPaymentUrl(url: string, postParams: any): void {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = url;

    for (const key in postParams) {
      if (postParams.hasOwnProperty(key)) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = postParams[key];
        form.appendChild(input);
      }
    }

    document.body.appendChild(form);
    form.submit();
  }

  // Retry payment method
  retryPayment(): void {
    const paymentData = this.getPaymentData();
    if (paymentData) {
      this.redirectToPaymentUrl(paymentData.url, paymentData.postParams);
    } else {
      console.error('No payment data found in localStorage.');
    }
  }
}
