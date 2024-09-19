import { Component, OnInit } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Component({
  selector: 'app-payment-faild',
  templateUrl: './payment-faild.component.html',
  styleUrls: ['./payment-faild.component.css'],
})
export class PaymentFaildComponent implements OnInit {
  secretKey: string = 'your-secret-key'; // Assurez-vous que cela correspond à la clé utilisée lors de l'enregistrement
  public oid: string | null = null;
  public storageItems: { key: string; value: string }[] = [];
  ngOnInit(): void {
    // Get payment data and extract the 'oid'
    const paymentData = this.getPaymentData();
    if (paymentData) {
      this.oid = paymentData.postParams['oid'];
      console.log('OID:', this.oid);
    }
    this.loadLocalStorageItems();
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
