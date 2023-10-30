import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LocalAuthComponent } from './pages/local-auth/local-auth.component';
import { CompetitionsComponent } from './pages/competitions/competitions.component';
import { RankingsComponent } from './pages/rankings/rankings.component';
import { TeamComponent } from './pages/team/team.component';
import { RulesComponent } from './pages/rules/rules.component';
import { AuthGuard } from './services/auth.guard';
import { FrontComponent } from './pages/front/front.component';

const routes: Routes = [
  {
    path: 'login',
    component: LocalAuthComponent,
  },
  {
    path: 'competitions',
    component: CompetitionsComponent,
  },
  {
    path: 'rankings',
    component: RankingsComponent,
  }, 
  {
    path: 'team',
    component: TeamComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'team/:competitionId',
    component: TeamComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'rules',
    component: RulesComponent,
  },

  {
    path: "**",
    component: FrontComponent 
  },
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
