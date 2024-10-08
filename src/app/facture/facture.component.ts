import { Component } from '@angular/core';
import { OptionsService } from '../options.service';
import { ActivatedRoute } from '@angular/router';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { UserService } from '../user.service';

@Component({
  selector: 'app-facture',
  templateUrl: './facture.component.html',
  styleUrl: './facture.component.css',
})
export class FactureComponent {
  orders: any[] = [];
  order: any;
  user: any;
  constructor(
    private optionsService: OptionsService,
    private userService: UserService,
    private route: ActivatedRoute
  ) {}
  ngOnInit(): void {
    const oreder = this.route.snapshot.paramMap.get('id');
    const accessToken = localStorage.getItem('loggedInUserToken');
    const userId = localStorage.getItem('loggedInUserId');
    this.optionsService
      .getOrderById(Number(oreder), accessToken!)
      .subscribe((data) => {
        this.order = data.data;
        this.orders = data.data.order_items;
      });

    this.userService
      .getUserInfoById(Number(userId), accessToken!)
      .subscribe((user) => {
        this.user = user.data;
        console.log('userrrrrr', this.order);
      });
  }

  downloadInvoice() {
    const invoiceElement = document.getElementById('invoice_wrapper');

    html2canvas(invoiceElement!).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // Largeur A4
      const pageHeight = 297; // Hauteur A4
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let position = 0;

      // Ajouter l'image dans le PDF
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);

      // Sauvegarder le fichier PDF
      pdf.save('facture.pdf');
    });
  }

  printInvoice() {
    const printContents = document.getElementById('invoice_wrapper')?.innerHTML;
    const originalContents = document.body.innerHTML;

    if (printContents) {
      document.body.innerHTML = printContents;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload(); // Recharge la page pour revenir à l'état initial
    }
  }
}
