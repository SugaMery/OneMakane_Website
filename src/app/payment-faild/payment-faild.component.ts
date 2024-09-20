import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-payment-faild',
  templateUrl: './payment-faild.component.html',
  styleUrls: ['./payment-faild.component.css'],
})
export class PaymentFaildComponent implements OnInit {
  paymentData: any;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // Effectuer une requête POST pour récupérer les données du serveur
    this.http.post<any>('https://dev.onemakan.ma/payment/failed', {}).subscribe(
      (data) => {
        this.paymentData = data;
        console.log(this.paymentData); // Afficher les données récupérées
      },
      (error) => {
        console.error('Erreur lors de la récupération des données POST', error);
      }
    );
  }
}
