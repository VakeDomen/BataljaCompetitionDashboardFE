import { Component, Input, OnChanges } from '@angular/core';
import { Bot } from 'src/app/models/bot.model';
import { BotStats } from 'src/app/models/bot.stats';
import { Rounds } from 'src/app/models/competition.rounds';

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
  public subSwitchPoints: any[] = [];

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
    let sum = 0;
    for (const round in this.rounds) {
      this.series1.push(this.rounds[round][0]);
      sum += this.rounds[round][0];
      this.series2.push(sum);
    }
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
