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
import { ChatComponent } from './chat/chat.component';
import { AllAdsComponent } from './all-ads/all-ads.component';
import { EditAdsComponent } from './edit-ads/edit-ads.component';
import { MessageAddAnnonceComponent } from './message-add-annonce/message-add-annonce.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { ContactUsComponent } from './contact-us/contact-us.component';
import { ConditionsGeneralesComponent } from './conditions-generales/conditions-generales.component';
import { MentionsLegalesComponent } from './mentions-legales/mentions-legales.component';
import { PageService } from './page.service';
import { CategoryService } from './category.service';
import { AdsGridComponent } from './ads-grid/ads-grid.component';
import { FavoisComponent } from './favois/favois.component';
import { CompteVendorComponent } from './compte-vendor/compte-vendor.component';
import { MessageComponent } from './message/message.component';
import { PostulerCvComponent } from './postuler-cv/postuler-cv.component';
import { MessageApresPostulerComponent } from './message-apres-postuler/message-apres-postuler.component';
import { JobCvsComponent } from './job-cvs/job-cvs.component';
import { CvsPreselectionesComponent } from './cvs-preselectiones/cvs-preselectiones.component';
import { PaymentSuccessComponent } from './payment-success/payment-success.component';
import { PaymentFaildComponent } from './payment-faild/payment-faild.component';
import { DuplicateAdsComponent } from './duplicate-ads/duplicate-ads.component';

const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'chat/:ad_id', component: ChatComponent, canActivate: [AuthGuard] },
  { path: 'chat', component: MessageComponent, canActivate: [AuthGuard] },
  /*   { path: 'ads-category/:id', component: AllAdsComponent },
   */ { path: 'ads-category/:id/:slug', component: AdsGridComponent },
  { path: 'account-activation', component: ActivityAccountComponent },
  { path: 'reset-password', component: ForgetPasswordComponent },
  { path: 'reset-password/email', component: ForgetPasswordMessageComponent },
  { path: 'postuler', component: MessageApresPostulerComponent },

  {
    path: 'modifier-annonce/:id',
    component: EditAdsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'payment/success',
    component: PaymentSuccessComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'payment/failed',
    component: PaymentFaildComponent,
    canActivate: [AuthGuard],
  },

  {
    path: 'voir-cvs/:id',
    component: JobCvsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'cvs-pré-sélectionnés/:id',
    component: CvsPreselectionesComponent,
    canActivate: [AuthGuard],
  },

  {
    path: 'postuler-annonce/:id',
    component: PostulerCvComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'compte/:userId/:uuId',
    component: CompteVendorComponent,
  },
  { path: 'messages', component: MessageComponent },
  {
    path: 'conditions_generales_de_ventes',
    component: ConditionsGeneralesComponent,
  },
  {
    path: 'favoris',
    canActivate: [AuthGuard],
    component: FavoisComponent,
  },

  {
    path: 'duplicate-annonce/:id',
    canActivate: [AuthGuard],
    component: DuplicateAdsComponent,
  },
  {
    path: 'mentions_legales',
    component: MentionsLegalesComponent,
  },
  {
    path: 'reset-password/:user_id/:password_token',
    component: ResetPasswordComponent,
  },
  {
    path: 'annonce_in_progress',
    component: MessageAddAnnonceComponent,
  },
  {
    path: 'account-activation/:userId/:activationToken',
    component: AccountActivationComponent,
  },
  {
    path: 'deposer_une_annonce',
    component: AddAdsComponent,
    canActivate: [AuthGuard],
  },

  {
    path: 'qui-sommes-nous',
    component: AboutUsComponent,
  },
  {
    path: 'contact-nous',
    component: ContactUsComponent,
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
export class AppRoutingModule {
  /*   slugPage: string = '';
  constructor(private pageService: PageService) {}

  loadPage(pageId: string, langId: string): void {
    this.pageService.getPage(pageId, langId).subscribe(
      (data) => {
        this.slugPage = data.data.title;
      },
      (error) => {
        console.error('Error fetching page data', error);
      }
    );
  } */
}
