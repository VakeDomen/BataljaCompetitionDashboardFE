import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';
import { TeamService } from './services/team.service';
import { UserService } from './services/user.service';
import { User } from './models/user.model';
import { Team } from './models/team.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent {
  title = 'BataljaCompetitionDashboardFE';

  constructor(
    private auth: AuthService,
    private teamService: TeamService,
    private userService: UserService,    
  ) { 
    if (this.auth.isLoggedIn()) {
      this.setupState()
    }
  }

  public setupState(): void {    
    // const state = this.auth.getState()
    // this.userService.getMe().subscribe((me: User) => state.setMe(me));
    // this.teamService.getTeams().subscribe((teams: Team[]) => state.setTeams(teams));
  }
}
