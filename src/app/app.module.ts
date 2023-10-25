import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { AuthInterceptor } from './services/auth.interceptor';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useFactory: function(router: Router, auth: AuthService, toastr: ToastrService) {
        return new AuthInterceptor(router, auth, toastr);
      },
      multi: true,
      deps: [Router, AuthService, ToastrService]
   },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
