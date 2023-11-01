import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { lastValueFrom } from 'rxjs';
import { Bot } from 'src/app/models/bot.model';
import { Competition } from 'src/app/models/competition.model';
import { Team } from 'src/app/models/team.model';
import { User } from 'src/app/models/user.model';
import { BotService } from 'src/app/services/bot.service';
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
  public selectedFile: File | null = null;
  public bots: Bot[] = [];

  // DISPLAY VARS
  public openSubmissionAccordion: string | undefined;
  

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private teamService: TeamService,
    private competitionService: CompetitionService,
    private userService: UserService,
    private toastr: ToastrService,
    private botService: BotService,
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
    await this.fetchBots();
    this.pageIsReady = true;
  }

  private async fetchBots(): Promise<void> {
    if (!this.team) {
      this.router.navigate(["competitions"]);
      return;
    }
    this.bots = await lastValueFrom(this.botService.getTeamBots(this.team.id));
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

    const team = teams.filter((t: Team) => t.competition_id == this.competitionId);
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
    this.teamService.leaveTeam(this.team?.id).subscribe(() => {
      this.toastr.success("Left team");
      this.router.navigate(["competitions"])
    }, () => {
      this.toastr.error("Failed to team?!");
    })
  }

  public disbandTeam(): void {
    if (!this.team) {
      return;
    }
    this.teamService.disbandTeam(this.team?.id).subscribe(() => {
      this.toastr.success("Left team");
      this.router.navigate(["competitions"])
    }, () => {
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

  // ########################### BOT METHODS ###########################

  public onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.selectedFile = input.files[0];
    }
  }

  public upload(): void {
    if (!this.team) {
      return;
    }
    if (!this.selectedFile) {
      this.toastr.error("Select a bot first")
    }
    if (this.selectedFile) {
      this.botService.uploadNewBot(this.team.id, this.selectedFile).subscribe(async (response: Bot) => {
        await this.fetchTeam()
        await this.fetchBots()
        this.toastr.success('Upload successful');
      }, () => {
        this.toastr.error("Something went wrong uploading the bot...")
      });
    }
  }

  public onBotChange(botSelector: "First" | "Second", selectedId: string) {
    if (!this.team || !this.competition) {
      return;
    }
    if (botSelector === "First") {
      this.team.bot1 = selectedId;
    }
    if (botSelector === "Second") {
      this.team.bot2 = selectedId;
    }

    this.botService.chageBot(
      this.competition.id, 
      this.team.id, 
      botSelector, 
      selectedId
    ).subscribe(() => {
      this.toastr.success("Active bot changed");
    })
  }

  // ########################### BOT METHODS END ###########################
// ########################### ACCORDION ###########################


accordionToggle(id: string | undefined) {
  if (this.openSubmissionAccordion == id) {
    this.openSubmissionAccordion = undefined;
  } else { 
    this.openSubmissionAccordion = id;
  }
}

// ########################### ACCORDION END ###########################


}
