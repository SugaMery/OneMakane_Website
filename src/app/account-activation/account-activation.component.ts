import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-account-activation',
  templateUrl: './account-activation.component.html',
  styleUrl: './account-activation.component.css',
})
export class AccountActivationComponent {
  userId!: string;
  activationToken!: string;
  constructor(
    private router: Router,
    private userService: UserService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.userId = params['userId'];
      this.activationToken = params['activationToken'];
      console.log('user', this.userId);

      this.userService
        .activateAccount(this.userId!, this.activationToken!)
        .subscribe((data) => data);
    });
  }
}
