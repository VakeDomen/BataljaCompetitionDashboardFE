import { Component, Input, OnChanges } from '@angular/core';
import { Bot } from 'src/app/models/bot.model';
import { Game2v2 } from 'src/app/models/game.model';
import { Team } from 'src/app/models/team.model';

type BotColor = 'red' | 'yellow' | 'blue' | 'green';

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

  public getBotLabel(game: Game2v2, bot: BotColor): string {
    if (this.isMyBot(game, bot)) {
      return this.getBotName(game, bot);
    } else {
      return "Enemy"
    }
  }

  private getBotName(game: Game2v2, bot: BotColor): string {
    const botId = this.getBotId(game, bot);
    if (!botId) {
      return "Unknown bot"
    }
    
    return this.bots.filter((b: Bot) => b.id == botId)[0].bot_name;
  }

  public botSurvived(game: Game2v2, bot: BotColor): boolean {
    if (bot == 'red') {
      return game.team1bot1_survived;
    }
    if (bot == 'green') {
      return game.team1bot2_survived;
    }
    if (bot == 'blue') {
      return game.team2bot1_survived;
    }
    if (bot == 'yellow') {
      return game.team2bot2_survived;
    }
    return false;
  }

  private getBotId(game: Game2v2, bot: BotColor): string | undefined {
    let botId
    if (bot == 'red') {
      botId = game.team1bot1_id;
    }
    if (bot == 'green') {
      botId = game.team1bot2_id;
    }
    if (bot == 'blue') {
      botId = game.team2bot1_id;
    }
    if (bot == 'yellow') {
      botId = game.team2bot2_id;
    }
    return botId;
  }

  public getEloLabel(game: Game2v2): string {
    if (this.isGameWon(game)) {
      return "(+1)"
    } else {
      return "(-1)"
    }
  }

  public isMyBot(game: Game2v2, bot: BotColor): boolean {
    let botTeam = ""
    if (bot == 'red') {
      botTeam = game.team1_id;
    }
    if (bot == 'green') {
      botTeam = game.team1_id;
    }
    if (bot == 'blue') {
      botTeam = game.team2_id;
    }
    if (bot == 'yellow') {
      botTeam = game.team2_id;
    }
    return botTeam == this.team?.id;
  }

  public isGameWonByBot(game: Game2v2, bot: BotColor): boolean {
    if (bot == 'blue' || bot == 'yellow') {
      return game.winner_id == game.team2_id;
    } else {
      return game.winner_id == game.team1_id;
    }
  }

  public isGameWon(game: Game2v2): boolean {
    if (this.team?.id == game.team2_id) {
      return game.winner_id == game.team2_id;
    } else {
      return game.winner_id == game.team1_id;
    }
  }

}
