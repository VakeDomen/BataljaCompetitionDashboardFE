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
import { RulesComponent } from './pages/rules/rules.component';
import { CompetitionTimerComponent } from './components/competition-timer/competition-timer.component';
import { FrontComponent } from './pages/front/front.component';
import { GameCanvasComponent } from './components/game-canvas/game-canvas.component';
import { NgApexchartsModule } from 'ng-apexcharts';
import { RoundsChartComponent } from './components/charts/rounds-chart/rounds-chart.component';
import { ChartsPanelComponent } from './components/charts-panel/charts-panel.component';
import { WinRateChartComponent } from './components/charts/win-rate-chart/win-rate-chart.component';
import { ScoreChartComponent } from './components/charts/score-chart/score-chart.component';

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
    RulesComponent,
    CompetitionTimerComponent,
    GameCanvasComponent,
    FrontComponent,
    RoundsChartComponent,
    ChartsPanelComponent,
    WinRateChartComponent,
    ScoreChartComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
    NgApexchartsModule,
    ToastrModule.forRoot({
      timeOut: 6000,
      positionClass: 'toast-bottom-right',
      toastClass: 'toast-color ngx-toastr',
    })
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
