import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { lastValueFrom } from 'rxjs';
import { Competition } from 'src/app/models/competition.model';
import { Team } from 'src/app/models/team.model';
import { User } from 'src/app/models/user.model';
import { CompetitionService } from 'src/app/services/competition.service';
import { TeamService } from 'src/app/services/team.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.sass']
})
export class TeamComponent implements OnInit {

  public pageIsReady: boolean = false;
  public competitionId: string;
  public team: Team | undefined;
  public competition: Competition | undefined;
  public player: User | undefined;
  public owner: User | undefined;
  public partner: User | undefined;
  public competitionStatus: string = "(Running)";

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private teamService: TeamService,
    private competitionService: CompetitionService,
    private userService: UserService,
    private toastr: ToastrService,
  ) { 
    this.competitionId = "";
    this.fixRoute()
  }

  ngOnInit(): void { }

  // ########################### PAGE SETUP ###########################
  
  private fixRoute() {
    this.route.paramMap.subscribe((params: ParamMap) => {
        let id = params.get('competitionId');
        
        // if everything is fine, load the page
        if (id) {
          this.competitionId = id;
          this.fetchData();
          return
        } 
        
        // otherwise reroute
        this.teamService.getTeams().subscribe((teams: Team[]) => {
          if (!teams.length) {
            this.router.navigate(["competitions"]);
          } else {
            this.router.navigate(["team", teams[0].competition_id]);
          }
        })
      }
    );
  }

  private async fetchData(): Promise<void> {
    await this.fetchTeam();
    await this.fetchUser();
    await this.fetchCompetition();
    this.pageIsReady = true;
  }
  private async fetchUser(): Promise<void> {
    if (!this.team) {
      this.router.navigate(["competitions"]);
      return;
    }
    
    // get me
    const user = await lastValueFrom(this.userService.getMe());
    if (!user) {
      this.router.navigate(["competitions"]);
      return;
    }
    if (this.team && (this.team.owner != user.id && this.team.partner != user.id)) {
      this.router.navigate(["competitions"]);
      return;
    }

    // get owner/parner...the other guy in the team
    if (this.team.owner == user.id) {
      this.owner = user;
      if (this.team.partner != "") {
        this.partner = await lastValueFrom(this.userService.getUserById(this.team.partner));
      }
    } else {
      this.owner = await lastValueFrom(this.userService.getUserById(this.team.owner));;
      this.partner = user;
    }

    this.player = user;
  }

  private async fetchCompetition(): Promise<void> {
    const competition = await lastValueFrom(this.competitionService.getCompetitionById(this.competitionId));
    if (!competition) {
      this.router.navigate(["competitions"]);
    }
    if (this.competitionService.isCompetitionRunning(competition)) {
      this.competitionStatus = "(Running)"
    } else {
      this.competitionStatus = "(Ended)"
    }
    this.competition = competition;
  }

  private async fetchTeam(): Promise<void> {
    const teams = await lastValueFrom(this.teamService.getTeams());
    if (!teams || !teams.length) {
      this.router.navigate(["competitions"]);
    }

    const team = teams.filter(t => t.competition_id == this.competitionId);
    if (!team || !team.length) {
      this.router.navigate(["competitions"]);
    }
    this.team = team[0];
  }

  // ########################### PAGE SETUP END ###########################

  // ########################### TEAM OPERATIONS ###########################

  public leaveTeam(): void {
    if (!this.team) {
      return;
    }
    this.teamService.leaveTeam(this.team?.id).subscribe((_) => {
      this.toastr.success("Left team");
      this.router.navigate(["competitions"])
    }, err => {
      this.toastr.error("Failed to team?!");
    })
  }

  public disbandTeam(): void {
    if (!this.team) {
      return;
    }
    this.teamService.disbandTeam(this.team?.id).subscribe((_) => {
      this.toastr.success("Left team");
      this.router.navigate(["competitions"])
    }, _ => {
      this.toastr.error("Failed to team?!");
    })
  }

  public teamHasPartner(): boolean {
    return !!this.partner;
  }

  // ########################### TEAM OPERATIONS END ###########################

  // ########################### LBEL METHODS ###########################

  public ownerName(): string {
    return this.owner ? this.owner.username : "Unknown"
  }

  public partnerName(): string {
    return this.partner ? this.partner.username : " -- (flying solo)"
  }

  // ########################### LBEL METHODS END ###########################

}
