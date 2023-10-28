import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Competition } from 'src/app/models/competition.model';
import { Team } from 'src/app/models/team.model';
import { User } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { CompetitionService } from 'src/app/services/competition.service';
import { TeamService } from 'src/app/services/team.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-competition-card',
  templateUrl: './competition-card.component.html',
  styleUrls: ['./competition-card.component.sass']
})
export class CompetitionCardComponent implements OnChanges {

  @Input() public competition: Competition | undefined;

  public hasTeam: boolean = false;

  constructor(
    private auth: AuthService,
    private rotuer: Router,
    private teamService: TeamService,
    private toastr: ToastrService,
    private userService: UserService,
    private competitionSerivce: CompetitionService,
  ) { }

  ngOnChanges(): void {
    this.hasTeamForCompetition()    
  }

  public async hasTeamForCompetition(): Promise<void> {
    if (!this.competition) {
      this.hasTeam = false;
      return;
    }
    this.hasTeam = await this.teamService.hasTeamForCompetition(this.competition.id);
  }

  public isLogged(): boolean {
    return this.auth.isLoggedIn();
  }

  public isAdmin(): boolean {
    return this.auth.isAdmin();
  }
  
  public calcNumOfTeams(): number {
    return 10;
  }

  public isCompetitionRunning(): boolean {
    if (!this.competition) {
      return false;
    }
    return this.competitionSerivce.isCompetitionRunning(this.competition);
  }

  public routeToTeam(): void {
    if (!this.competition) {
      return
    }
    this.rotuer.navigate(["team", this.competition.id])
  }

  public createTeam(): void {
    const competitionId = this.competition?.id
    this.userService.getMe().subscribe((me: User) => {
      const owner = me.id;
      if (!!competitionId && !!owner) {
        this.teamService.createTeam(owner, competitionId).subscribe((t: Team) => {
          this.toastr.success("Team Created");
          this.routeToTeam()
        });
      }
    })
  }
}
