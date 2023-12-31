import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Gtag } from 'angular-gtag';
import { ToastrService } from 'ngx-toastr';
import { lastValueFrom } from 'rxjs';
import { Bot } from 'src/app/models/bot.model';
import { BotStats } from 'src/app/models/bot.stats';
import { Competition } from 'src/app/models/competition.model';
import { Rounds } from 'src/app/models/competition.rounds';
import { Game2v2 } from 'src/app/models/game.model';
import { Team } from 'src/app/models/team.model';
import { User } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { BotService } from 'src/app/services/bot.service';
import { CompetitionService } from 'src/app/services/competition.service';
import { GameService } from 'src/app/services/game.service';
import { TeamService } from 'src/app/services/team.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.sass']
})
export class TeamComponent implements OnInit {

  public competitionId: string;
  public team: Team | undefined;
  public competition: Competition | undefined;
  public player: User | undefined;
  public owner: User | undefined;
  public partner: User | undefined;
  public competitionStatus: string = "(Running)";
  public selectedFile: File | null = null;
  public bots: Bot[] = [];
  public botStats: BotStats = {};
  public rounds: Rounds = {};
  public roundGames: Game2v2[] = [];
  public roundSelected: string | undefined;


  public teamId: string | undefined;
  
  // DISPLAY VARS
  public pageIsReady: boolean = false;
  public gamesReady: boolean = false;
  public openSubmissionAccordion: string | undefined;
  public tabOpen: 'overall' | 'games' | 'bots' = 'overall';
  public confirmationModalOpen: boolean = false;
  public renameModalOpen: boolean = false;
  public newName: string = "";
  public bot1Id: string = "";
  public bot2Id: string = "";

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private teamService: TeamService,
    private competitionService: CompetitionService,
    private userService: UserService,
    private toastr: ToastrService,
    private botService: BotService,
    private gameService: GameService,
    private authService: AuthService,
  ) {
    this.competitionId = "";
    this.fixRoute()
  }

  ngOnInit(): void { }

  // ########################### PAGE SETUP ###########################

  private fixRoute() {
    this.route.paramMap.subscribe((params: ParamMap) => {
      let id = params.get('competitionId');
      this.teamId = params.get('teamId') ?? undefined;

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
          this.router.navigate(["team", teams[teams.length - 1].competition_id]);
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
    await this.fetchBotStats();
    await this.fetchRounds()
    await this.fetchRoundGames();
    this.finalizeLoad();
  }

  private finalizeLoad() {
    if (this.bots.length == 0) {
      this.tabOpen = 'bots';
    }
    this.pageIsReady = true;
    this.gamesReady = true;
  }

  private async fetchRoundGames() {
    if (!this.roundSelected) {
      return
    }
    const gamesPromises = this.rounds[this.roundSelected][3].map((gid: string) => {
      return lastValueFrom(this.gameService.getGameById(gid))
    })
    this.roundGames = await Promise.all(gamesPromises);
  }

  private async fetchRounds() {
    if (!this.team) {
      this.router.navigate(["competitions"]);
      return;
    }
    this.rounds = (await lastValueFrom(this.competitionService.getRounds(this.team.id))) as unknown as Rounds;
    // preselect the last round
    // set the roundSelected to the last round key in the rounds
    const index = Object.keys(this.rounds).length - 1;
    if (index >= 0) {
      this.roundSelected = Object.keys(this.rounds)[index]
    }
  }

  private async fetchBotStats(): Promise<void> {
    if (!this.team) {
      this.router.navigate(["competitions"]);
      return;
    }
    this.botStats = (await lastValueFrom(this.botService.getBotsStats(this.team.id))) as unknown as BotStats;
    for (const botId in this.botStats) {
      if (!this.botStats[botId][0]) this.botStats[botId][0] = 0;
      if (!this.botStats[botId][1]) this.botStats[botId][1] = 0;
    }
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
    if (
      this.team && 
      (this.team.owner != user.id && this.team.partner != user.id) &&
      !this.authService.isAdmin()
    ) {
      this.router.navigate(["competitions"]);
      return;
    }

    // get owner/parner...the other guy in the team
    if (this.team.owner == user.id) {
      this.owner = user;
    } else {
      this.owner = await lastValueFrom(this.userService.getUserById(this.team.owner));
    }

    if (this.team.partner != "") {
      this.partner = await lastValueFrom(this.userService.getUserById(this.team.partner));
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
    let teams;
    if (!this.teamId) {
      teams = await lastValueFrom(this.teamService.getTeams());
    } else {
      teams = [await lastValueFrom(this.teamService.getTeamById(this.teamId))];
    }
    if (!teams || !teams.length) {
      this.router.navigate(["competitions"]);
    }

    const team = teams.filter((t: Team) => t.competition_id == this.competitionId);
    if (!team || !team.length) {
      this.router.navigate(["competitions"]);
    }
    this.team = team[0];
    if (this.team.bot1 != this.bot1Id) {
        this.bot1Id = this.team.bot1;
    }
    if(this.team.bot2 != this.bot2Id) {
        this.bot2Id = this.team.bot2;
    }
  }

  // ########################### PAGE SETUP END ###########################

  // ########################### GAMES ###########################
  public async fetchNewRoundGames(): Promise<void> {
    this.gamesReady = false;
    await this.fetchRoundGames();
    this.gamesReady = true;
  }
  // ########################### GAMES END ###########################


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

  public getRoundKeys(): string[] {
    return Object.keys(this.rounds);
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
        this.bots.push(response);
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
      this.bot1Id = selectedId;
    }
    if (botSelector === "Second") {
      this.team.bot2 = selectedId;
      this.bot2Id = selectedId;
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


  public accordionToggle(id: string | undefined) {
    if (this.openSubmissionAccordion == id) {
      this.openSubmissionAccordion = undefined;
    } else {
      this.openSubmissionAccordion = id;
    }
  }

  // ########################### ACCORDION END ###########################

  // ########################### MODAL ###########################
  public confimModal(): void {
    if (this.team?.owner == this.player?.id) {
      this.disbandTeam();
    } else {
      this.leaveTeam();
    }
  }

  public confimRenameModal(): void {
    if (!this.newName) {
      this.toastr.error("Enter new name");
    }
    this.teamService.renameTeam(this.competitionId, this.newName).subscribe((t: Team) => {
      this.team = t;
      this.renameModalOpen = false;
    });
  }

  // ########################### MODAL END ###########################

}