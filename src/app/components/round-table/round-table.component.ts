import { Component, Input, OnChanges } from '@angular/core';
import { Bot } from 'src/app/models/bot.model';
import { Game2v2 } from 'src/app/models/game.model';
import { Team } from 'src/app/models/team.model';

type BotSelector = 'my1' | 'my2' | 'e1' | 'e2';

@Component({
  selector: 'app-round-table',
  templateUrl: './round-table.component.html',
  styleUrls: ['./round-table.component.sass']
})
export class RoundTableComponent implements OnChanges {

  @Input() public games: Game2v2[] = [];
  @Input() public team: Team | undefined;
  @Input() public bots: Bot[] = [];

  ngOnChanges() {

  }

  public getBotLabel(game: Game2v2, bot: BotSelector): string {
    if (bot == 'my1' || bot == 'my2') {
      return this.getBotName(game, bot);
    } else {
      return "Enemy"
    }
  }

  private getBotName(game: Game2v2, bot: BotSelector): string {
    const botId = this.getBotId(game, bot);
    if (!botId) {
      return "Unknown bot"
    }
    
    return this.bots.filter((b: Bot) => b.id == botId)[0].bot_name;
  }

  public botSurvived(game: Game2v2, bot: BotSelector): boolean {
    if (bot == 'my1') {
      if (this.isTeam1(game)) return game.team1bot1_survived;
      else return game.team2bot1_survived;
    }
    if (bot == 'my2') {
      if (this.isTeam1(game)) return game.team1bot2_survived;
      else return game.team2bot2_survived;
    }
    if (bot == 'e1') {
      if (this.isTeam1(game)) return game.team2bot1_survived;
      else return game.team1bot1_survived;
    }
    if (bot == 'e2') {
      if (this.isTeam1(game)) return game.team2bot2_survived;
      else return game.team1bot2_survived;
    }
    return false;
  }

  private isTeam1(game: Game2v2): boolean {
    return game.team1_id == this.team?.id
  }

  private getBotId(game: Game2v2, bot: BotSelector): string | undefined {
    if (bot == 'my1') {
      if (this.isTeam1(game)) return game.team1bot1_id;
      else return game.team2bot1_id;
    }
    if (bot == 'my2') {
      if (this.isTeam1(game)) return game.team1bot2_id;
      else return game.team2bot2_id;
    }
    if (bot == 'e1') {
      if (this.isTeam1(game)) return game.team2bot1_id;
      else return game.team1bot1_id;
    }
    if (bot == 'e2') {
      if (this.isTeam1(game)) return game.team2bot2_id;
      else return game.team1bot2_id;
    }
    return undefined;
  }

  public getEloLabel(game: Game2v2): string {
    if (this.isGameWon(game)) {
      return "(+1)"
    } else {
      return "(-1)"
    }
  }

  public isGameWonByBot(game: Game2v2, bot: BotSelector): boolean {
    return game.winner_id == this.team?.id;
  }

  public isGameWon(game: Game2v2): boolean {
    if (this.team?.id == game.team2_id) {
      return game.winner_id == game.team2_id;
    } else {
      return game.winner_id == game.team1_id;
    }
  }

}
