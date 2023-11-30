import { Component, Input, OnChanges } from '@angular/core';
import { Bot } from 'src/app/models/bot.model';
import { Game2v2 } from 'src/app/models/game.model';
import { GameAdditionalData } from 'src/app/models/game.stats';
import { Team } from 'src/app/models/team.model';

export type BotSelector = 'my1' | 'my2' | 'e1' | 'e2';

@Component({
  selector: 'app-round-table',
  templateUrl: './round-table.component.html',
  styleUrls: ['./round-table.component.sass']
})
export class RoundTableComponent implements OnChanges {

  @Input() public games: Game2v2[] = [];
  @Input() public team: Team | undefined;
  @Input() public bots: Bot[] = [];

  public openVideoModal: boolean = false;
  public gameToPlay: Game2v2 | undefined;
  public gameDetailsOpened: Game2v2 | undefined;

  ngOnChanges() {
    console.log(this.games);
  }

  public getBotLabel(game: Game2v2, bot: BotSelector): string {
    if (bot == 'my1' || bot == 'my2') {
      return this.getBotName(game, bot);
    } else {
      return "Enemy"
    }
  }

  public gameDataContainsErrors(game: Game2v2): boolean  {
    const additionalData = JSON.parse(game.additional_data);
    return Object.keys(additionalData).includes("error");
  }

  private getBotName(game: Game2v2, bot: BotSelector): string {
    const botId = this.getBotId(game, bot);
    if (!botId) {
      return "Unknown bot"
    }
    
    return this.bots.filter((b: Bot) => b.id == botId)[0].bot_name;
  }

  public botSurvived(game: Game2v2, bot: BotSelector): boolean {
    if (this.isTeam1(game)) {
      if (bot == 'my1') return game.team1bot1_survived;
      if (bot == 'my2') return game.team1bot2_survived;
      if (bot == 'e1') return game.team2bot1_survived;
      if (bot == 'e2') return game.team2bot2_survived;
    } else {
      if (bot == 'my1') return game.team2bot1_survived;
      if (bot == 'my2') return game.team2bot2_survived;
      if (bot == 'e1') return game.team1bot1_survived;
      if (bot == 'e2') return game.team1bot2_survived;
    }
    return true;
  }

  public isTeam1(game: Game2v2): boolean {
    return game.team1_id == this.team?.id
  }
  public isTeam2(game: Game2v2): boolean {
    return game.team2_id == this.team?.id
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
    if (game.team1_id == game.team2_id) {
      return "(0)";
    } else if (game.team1_id == this.team?.id) {
      return `(${this.isGameWon(game) ? '+' : ''}${game.team1_elo})`;
    } else {
      return `(${this.isGameWon(game) ? '+' : ''}${game.team2_elo})`;
    }
  }

  public isZeroElo(game: Game2v2): boolean {
    if (game.team1_id == game.team2_id) {
      return true;
    } else if (game.team1_id == this.team?.id) {
      return game.team1_elo == 0;
    } else {
      return game.team2_elo == 0;
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

  public getMyBotImage(game: Game2v2, bot: BotSelector): string {
    if (this.isTeam2(game)) {
      if (bot == 'my1') {
        return "assets/Blue.png";
      } else {
        return "assets/Cyan.png";
      }
    }else {
      if (bot == 'my1') {
        return "assets/Toxic.png";
      } else {
        return "assets/Yellow.png";
      }
    }
  }

  public getAdditionalData(game: Game2v2): GameAdditionalData | undefined {
    if (!this.gameDataContainsErrors(game)) {
      return JSON.parse(game.additional_data) as GameAdditionalData;
    }
    return undefined;
  }

  public toggleGame(game: Game2v2): void {
    if (this.gameDetailsOpened == game) {
      this.gameDetailsOpened = undefined;
    } else {
      this.gameDetailsOpened = game ; 
    }
    this.openVideoModal = false
  }

  public botCrashed(game: Game2v2, bot: BotSelector) {
    if (!this.gameDataContainsErrors(game)) {
      return false;
    }
    return this.getBotId(game, bot) == JSON.parse(game.additional_data)["blame_id"];
  }
  
  public botTimedout(game: Game2v2, bot: BotSelector): boolean {
    if (this.gameDataContainsErrors(game)) {
      return false;
    }
    return JSON.parse(game.additional_data)[this.getBotDataKey(game, bot)]["turns_played"] == 1000;
  }

  private getBotDataKey(game: Game2v2,bot: BotSelector): string {
    if (this.isTeam1(game)) {
      if (bot == 'my1') return "team1bot1";
      if (bot == 'my2') return "team1bot2";
      if (bot == 'e1') return "team2bot1";
      if (bot == 'e2') return "team2bot2";
    } else {
      if (bot == 'my1') return "team2bot1";
      if (bot == 'my2') return "team2bot2";
      if (bot == 'e1') return "team1bot1";
      if (bot == 'e2') return "team1bot2";
    }
    return ""
  }


  public getCrashError(game: Game2v2): string {
    if (!this.gameDataContainsErrors(game)) {
      return "Unknown Error";
    } else {
      return JSON.parse(game.additional_data).error;
    }
  }
}
