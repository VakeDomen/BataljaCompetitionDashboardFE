import { TmplAstBoundAttribute } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { Bot } from 'src/app/models/bot.model';
import { Competition } from 'src/app/models/competition.model';
import { Team } from 'src/app/models/team.model';
import { BotService } from 'src/app/services/bot.service';
import { CompetitionService } from 'src/app/services/competition.service';
import { TeamService } from 'src/app/services/team.service';
import { UserService } from 'src/app/services/user.service';


interface TeamData {
  owner: string,
  partner: string,
}

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.sass']
})
export class StatsComponent implements OnInit {

  public pageIsReady: boolean = false;
  private competitionId: string;
  public teams: Team[] = [];
  public teamData: Map<Team, TeamData> = new Map()
  public teamBots: Map<Team, Bot[]> = new Map()

  public hoveredBotOwner: Team | undefined;

  constructor(
    private teamService: TeamService,
    private competitionService: CompetitionService,
    private userService: UserService,
    private botService: BotService,
    private route: ActivatedRoute,
    private router: Router,
  ) { 
    this.competitionId = "";
    this.fixRoute();
  }

  ngOnInit(): void {
  }

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
      this.competitionService.getRunningCompetitions().subscribe((comps: Competition[]) => {
        if (!comps.length) {
          this.router.navigate(["competitions"]);
        } else {
          this.router.navigate(["stats", comps[0].id]);
        }
      })
    }
    );
  }

  public getPlayerName(team: Team, selector: "owner" | "partner"): string {
    if (!team) {
      return "/";
    }
    const data = this.teamData.get(team);
    if (!data) {
      return "/";
    }
    return selector == 'owner' ? data.owner : data.partner;
  }


  private async fetchData(): Promise<void> {
    console.log(this.competitionId)
    // get teams and player names
    this.teams = await lastValueFrom(this.teamService.getAllTeams(this.competitionId));
    for (const team of this.teams) {
      const owner = (await lastValueFrom(this.userService.getUserById(team.owner))).username;
      let partner = "/";
      if (team.partner && team.partner != "") {
        partner = (await lastValueFrom(this.userService.getUserById(team.partner))).username;
      } 
      this.teamData.set(team, {
        owner: owner,
        partner: partner,
      })
    }

    // get bots
    for (const team of this.teams) {
      let bots = await lastValueFrom(this.botService.getTeamBots(team.id));
      this.teamBots.set(team, bots);
    }


    this.pageIsReady = true;
  }

  public getBotCountLabel(team: Team): string {
    const bots = this.teamBots.get(team);
    if (!bots || !bots.length) {
      return "/"
    } 
    const unbugged = bots.filter((b: Bot) => b.compile_error == "").length;
    return `${unbugged}/${bots.length}`
  }

  public getCreatedLabel(team: Team): string {
    return team.created.split("T")[0];
  }

  public getLastUpload(team: Team) {
    const bots = this.teamBots.get(team);
    if (!bots || !bots.length) {
      return "/"
    }

    return bots.sort((b1: Bot, b2: Bot) => (b2.created > b1.created) ? 1 : -1)[0].created.split("T")[0];
  }

  public getLatestBots(): Bot[] {
    const allBots = [];
    for (const team of this.teams) {
      const bots = this.teamBots.get(team);
      if (!bots) {
        continue;
      }
      allBots.push(...bots);
    }

    const sorted = allBots.sort((b1: Bot, b2: Bot) => (b2.created > b1.created) ? 1 : -1);
    return sorted.splice(0, 10);
  }

  public getUploadedLabel(bot: Bot): string {
    return bot.created.split("T")[0];
  }

  public getTeamCount(): number {
    return this.teams.length;
  }

  public compiled(bot: Bot): boolean {
    return bot.compile_error == "";
  }

  public selectOwner(bot: Bot) {
    this.hoveredBotOwner = this.teams.filter(t => t.id == bot.team_id)[0];
  }
  public unselectOwner() {
    this.hoveredBotOwner = undefined
  }
}


