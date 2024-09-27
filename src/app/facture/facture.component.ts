import { Component } from '@angular/core';
import { OptionsService } from '../options.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-facture',
  templateUrl: './facture.component.html',
  styleUrl: './facture.component.css',
})
export class FactureComponent {
  orders: any[] = [];
  order: any;

  constructor(
    private optionsService: OptionsService,
    private route: ActivatedRoute
  ) {}
  ngOnInit(): void {
    const oreder = this.route.snapshot.paramMap.get('id');
    const accessToken = localStorage.getItem('loggedInUserToken');
    this.optionsService
      .getOrderById(Number(oreder), accessToken!)
      .subscribe((data) => {
        this.order = data.data;
        this.orders = data.data.order_items;
      });
  }
}
