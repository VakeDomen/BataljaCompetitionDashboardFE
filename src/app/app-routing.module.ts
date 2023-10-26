import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LocalAuthComponent } from './pages/local-auth/local-auth.component';
import { CompetitionsComponent } from './pages/competitions/competitions.component';
import { RankingsComponent } from './pages/rankings/rankings.component';
import { TeamComponent } from './pages/team/team.component';

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
  },

];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
