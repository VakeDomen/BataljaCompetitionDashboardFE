import { Component, Input, OnChanges } from '@angular/core';
import { Bot } from 'src/app/models/bot.model';
import { BotStats } from 'src/app/models/bot.stats';
import { Rounds } from 'src/app/models/competition.rounds';
import { Annotation } from '../charts/score-chart/score-chart.component';
import { Team } from 'src/app/models/team.model';

@Component({
  selector: 'app-charts-panel',
  templateUrl: './charts-panel.component.html',
  styleUrls: ['./charts-panel.component.sass']
})
export class ChartsPanelComponent implements OnChanges {

  private MAX_RADIALS: number = 4;
  private MAX_SCORE_ROUNDS = 40;

  public dataReady = true;

  @Input() bots: Bot[] = [];
  @Input() botStats: BotStats = {}
  @Input() rounds: Rounds = {}
  @Input() team: Team | undefined;

  /*
    win rate chart
  */

  public wrlabels: string[] = [];
  public wrseries: any[] = [];

  public srlabels: string[] = [];
  public srseries: any[] = [];

  /*
    score chart
  */
  public roundSeries: any[] = [];
  public totalEloSeries: any[] = [];
  public labels: string[] = [];
  public subSwitchPoints: Annotation[] = [];

  ngOnChanges(): void {
    if (Object.keys(this.botStats).length && this.bots) {
      this.setWinAndSurvivalRates();
    }
    if (Object.keys(this.rounds).length && this.bots) {
      this.setRoundAndScoreSeries();
    }
  }

  private setRoundAndScoreSeries() {
    this.roundSeries = [];
    this.totalEloSeries = [];
    this.labels = [];
    let sum = 0;

    let roundKeys = Object.keys(this.rounds);
    // setup rounds series
    for (let i = 0 ; i <= +roundKeys[roundKeys.length - 1] ; i++) {
      let round: [number, string, string, string[]] | undefined = this.rounds[i];
      this.roundSeries[i] = round ? round[0] : 0;
      sum += this.roundSeries[i];
      this.labels.push(`${i}`);
    }
    
    // setup total elo
    // start from current elo
    // go backwards and remove elo change backwards
    let curentElo = this.team?.elo ?? 1000;
    this.totalEloSeries.push(curentElo);
    for (const round of this.roundSeries.reverse()) {
      curentElo -= round;
      this.totalEloSeries.push(curentElo);
    }
    this.totalEloSeries.reverse() // was built backwards
    this.roundSeries.reverse() // set back into original direction
    
    this.createAnnotations();
  }
  private createAnnotations(): void {
    this.subSwitchPoints = [];
    let currentBotPair: [string, string] | undefined;
    for (const key of Object.keys(this.rounds)) {
      let round = this.rounds[key];
      
      if (!currentBotPair) {
        currentBotPair = [round[1], round[2]];
      }

      // bot change
      if (currentBotPair[0] !== round[1] || currentBotPair[1] !== round[2]) {
        this.subSwitchPoints.push({
          x: key,
          y: this.totalEloSeries[+key],
          marker: {
            fillColor: "#4e4e4e",
            size: 5,
            radius: 3,
          },
          label: {
            borderColor: '#c0c0c0',
            offsetY: 0,
            style: {
              color: '#fff',
              background: '#4e4e4e',
            },
            text: `${this.getBotName(round[1])} & 
            ${this.getBotName(round[2])}`,
          }
        } as unknown as Annotation);
        currentBotPair = [round[1], round[2]];
      }
    }
    console.log(this.subSwitchPoints)
  }

  private getBotName(id: string): string {
    const bot = this.bots.filter(b => b.id == id)[0];
    if (!bot) {
      return "Unknown bot";
    }
    return bot.bot_name;
  }

  private setWinAndSurvivalRates(): void {
    this.wrseries = [];
    this.wrlabels = [];
    this.srseries = [];
    this.srlabels = [];
    for (const bot of this.bots) {
      this.wrlabels.push(bot.bot_name);
      this.srlabels.push(bot.bot_name);
      const stats = this.botStats[bot.id];
      if (!stats) {
        this.wrseries.push(0);
        this.srseries.push(0);
      } else {
        this.wrseries.push(Math.round(stats[0] * 100));
        this.srseries.push(Math.round(stats[1] * 100));
      }
    }
  }

  public numOfRounds(): number {
    return Object.keys(this.rounds).length;
  }
}
