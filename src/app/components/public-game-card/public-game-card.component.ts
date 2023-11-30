import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { Competition } from 'src/app/models/competition.model';
import { Game2v2 } from 'src/app/models/game.model';
import { Team } from 'src/app/models/team.model';
import { CompetitionService } from 'src/app/services/competition.service';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: 'app-public-game-card',
  templateUrl: './public-game-card.component.html',
  styleUrls: ['./public-game-card.component.sass']
})
export class PublicGameCardComponent implements OnChanges {
  @Input() public game: Game2v2 | undefined;

  public pageIsReady: boolean = false;

  public team1: Team | undefined;
  public team2: Team | undefined;
  public competition: Competition | undefined;


  public openVideoModal: boolean = false;

  constructor(
    private competitionService: CompetitionService,
    private teamService: TeamService,
  ) { }
  
  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (!this.game) {
      return
    }
    this.competition = await lastValueFrom(this.competitionService.getCompetitionById(this.game.competition_id))
    this.team1 = await lastValueFrom(this.teamService.getTeamById(this.game.team1_id)) ?? undefined;
    this.team2 = await lastValueFrom(this.teamService.getTeamById(this.game.team2_id)) ?? undefined;
    this.pageIsReady = true;
  }

  public getTeamName(t: 1 | 2): string {
    if (t == 1) {
      if (!this.team1) {
        return "[deleted team]"
      }
      return this.team1.name;
    } else {
      if (!this.team2) {
        return "[deleted team]"
      }
      return this.team2.name;
    }
  }

  public getGameWinner(): string {
    if (!this.game) {
      return "Unknown"
    }
    if (this.game.team1_id == this.game.winner_id) {
      return this.team1?.name ?? "Team 1"; 
    } else {
      return this.team2?.name ?? "Team 2"; 
    }
  }

  public team1Won(): boolean {
    if (!this.game) return false;
    return this.game.team1_id == this.game.winner_id
  }

  public getGameTurns(): number {
    if (!this.game) {
      return 0;
    }
    const additionalData = JSON.parse(this.game?.additional_data);
    
    let maxTurn = 0;
    for (const key of Object.keys(additionalData)) {
      let t = additionalData[key]["turns_played"];
      if (t > maxTurn) maxTurn = t;
    }
    return maxTurn;
  }
}
