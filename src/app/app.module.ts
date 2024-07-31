import { NgModule } from '@angular/core';
import {
  BrowserModule,
  provideClientHydration,
} from '@angular/platform-browser';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';
import { HomePageComponent } from './home-page/home-page.component';
import { PreloaderComponent } from './preloader/preloader.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { LoginComponent } from './login/login.component';
import { ReactiveFormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { RegisterComponent } from './register/register.component';
import { JwtModule } from '@auth0/angular-jwt';
import { PageAccountComponent } from './page-account/page-account.component';
import { StepperModule } from 'primeng/stepper';
import { TableModule } from 'primeng/table';
import { ProgressBarModule } from 'primeng/progressbar'; // Import ProgressBarModule
import { TagModule } from 'primeng/tag'; // Import TagModule
import { DialogModule } from 'primeng/dialog';
import { AddAdsComponent } from './add-ads/add-ads.component';
import { CarouselModule } from 'primeng/carousel';
import { AdsDetailComponent } from './ads-detail/ads-detail.component';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { GoogleMapComponent } from './google-map/google-map.component';
import { ActivityAccountComponent } from './activity-account/activity-account.component';
import { ForgetPasswordComponent } from './forget-password/forget-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { ForgetPasswordMessageComponent } from './forget-password-message/forget-password-message.component';
import { AccountActivationComponent } from './account-activation/account-activation.component';
import { ChatComponent } from './chat/chat.component';
import { AllAdsComponent } from './all-ads/all-ads.component';
import { EditAdsComponent } from './edit-ads/edit-ads.component';
import { MessageAddAnnonceComponent } from './message-add-annonce/message-add-annonce.component';
import { CalendarModule } from 'primeng/calendar';
import { AboutUsComponent } from './about-us/about-us.component';
import { ContactUsComponent } from './contact-us/contact-us.component';
import { ConditionsGeneralesComponent } from './conditions-generales/conditions-generales.component';
import { MentionsLegalesComponent } from './mentions-legales/mentions-legales.component';
import { AdsGridComponent } from './ads-grid/ads-grid.component';
import { ImageModule } from 'primeng/image';
import { GalleriaModule } from 'primeng/galleria';
import { FavoisComponent } from './favois/favois.component';
import { CompteVendorComponent } from './compte-vendor/compte-vendor.component';
import { MessageComponent } from './message/message.component';
import { MatSliderModule } from '@angular/material/slider';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { EnterKeyDirective } from './enter-key.directive';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    FooterComponent,
    HeaderComponent,
    HomePageComponent,
    PreloaderComponent,
    LoginComponent,
    RegisterComponent,
    PageAccountComponent,
    AddAdsComponent,
    AdsDetailComponent,
    GoogleMapComponent,
    ActivityAccountComponent,
    ForgetPasswordComponent,
    ResetPasswordComponent,
    ForgetPasswordMessageComponent,
    AccountActivationComponent,
    ChatComponent,
    AllAdsComponent,
    EditAdsComponent,
    MessageAddAnnonceComponent,
    AboutUsComponent,
    ContactUsComponent,
    ConditionsGeneralesComponent,
    MentionsLegalesComponent,
    AdsGridComponent,
    FavoisComponent,
    CompteVendorComponent,
    MessageComponent,
    EnterKeyDirective,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownModule,
    BrowserAnimationsModule,
    ConfirmDialogModule,
    ToastModule,
    StepperModule,
    TableModule,
    ProgressBarModule,
    TagModule,
    DialogModule,
    CarouselModule,
    AvatarModule,
    AvatarGroupModule,
    CalendarModule,
    ImageModule,
    GalleriaModule,
    FormsModule,
    MatSliderModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    JwtModule.forRoot({
      config: {
        tokenGetter: () => {
          return localStorage.getItem('loggedInUserToken');
        },
      },
    }),
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [provideClientHydration()],
  bootstrap: [AppComponent],
})
export class AppModule {}
