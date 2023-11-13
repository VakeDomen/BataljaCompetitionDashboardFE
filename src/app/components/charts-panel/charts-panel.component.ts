import { Component, Input, OnChanges } from '@angular/core';
import { Bot } from 'src/app/models/bot.model';
import { BotStats } from 'src/app/models/bot.stats';
import { Rounds } from 'src/app/models/competition.rounds';
import { Annotation } from '../charts/score-chart/score-chart.component';

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
  public series1: any[] = [];
  public series2: any[] = [];
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
    this.series1 = [];
    this.series2 = [];
    this.labels = [];
    let sum = 0;

    let roundKeys = Object.keys(this.rounds);
    for (let i = 0 ; i < +roundKeys[roundKeys.length - 1] ; i++) {
      let round: [number, string, string, string[]] | undefined = this.rounds[i];
      this.series1[i] = round ? round[0] : 0;
      sum += this.series1[i];
      this.series2[i] = sum;
      this.labels.push(`${i}`);
    }
    console.log(this.series2);
    
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
          y: this.series2[+key],
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
