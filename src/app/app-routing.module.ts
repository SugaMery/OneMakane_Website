import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePageComponent } from './home-page/home-page.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { PageAccountComponent } from './page-account/page-account.component';
import { AuthGuard } from './auth.guard';
import { AddAdsComponent } from './add-ads/add-ads.component';
import { AdsDetailComponent } from './ads-detail/ads-detail.component';
import { ActivityAccountComponent } from './activity-account/activity-account.component';
import { ForgetPasswordComponent } from './forget-password/forget-password.component';
import { ForgetPasswordMessageComponent } from './forget-password-message/forget-password-message.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { AccountActivationComponent } from './account-activation/account-activation.component';

const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'account-activation', component: ActivityAccountComponent },
  { path: 'reset-password', component: ForgetPasswordComponent },
  { path: 'reset-password/email', component: ForgetPasswordMessageComponent },
  { path: 'reset-password/:user_id/:password_token', component: ResetPasswordComponent },
  { path: 'account-activation/:userId/:activationToken', component: AccountActivationComponent },
  {
    path: 'deposer_une_annonce',
    component: AddAdsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'page-account',
    component: PageAccountComponent,
    canActivate: [AuthGuard],
  },
  { path: 'ads/:id', component: AdsDetailComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
