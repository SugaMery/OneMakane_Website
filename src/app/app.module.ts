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
import { HttpClientModule } from '@angular/common/http';
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
    JwtModule.forRoot({
      config: {
        tokenGetter: () => {
          return localStorage.getItem('loggedInUserToken');
        },
      },
    }),
  ],
  providers: [provideClientHydration()],
  bootstrap: [AppComponent],
})
export class AppModule {}
