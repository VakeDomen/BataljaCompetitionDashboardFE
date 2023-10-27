import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { AuthInterceptor } from './services/auth.interceptor';
import { NavbarComponent } from './components/navbar/navbar.component';
import { LocalAuthComponent } from './pages/local-auth/local-auth.component';
import { LoginComponent } from './pages/login/login.component';
import { FormsModule } from '@angular/forms';
import { CompetitionsComponent } from './pages/competitions/competitions.component';
import { TeamComponent } from './pages/team/team.component';
import { RankingsComponent } from './pages/rankings/rankings.component';
import { StatsComponent } from './pages/stats/stats.component';
import { CompetitionCardComponent } from './components/competition-card/competition-card.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    LocalAuthComponent,
    LoginComponent,
    CompetitionsComponent,
    TeamComponent,
    RankingsComponent,
    StatsComponent,
    CompetitionCardComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
    ToastrModule.forRoot()
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
