import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LocalAuthComponent } from './pages/local-auth/local-auth.component';

const routes: Routes = [
  {
    path: 'login',
    component: LocalAuthComponent,
  },
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
