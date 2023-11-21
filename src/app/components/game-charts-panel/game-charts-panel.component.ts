import { Component, Input } from '@angular/core';
import { ApexAxisChartSeries, ApexChart, ApexDataLabels, ApexGrid, ApexPlotOptions, ApexStroke, ApexTitleSubtitle, ApexTooltip, ApexXAxis } from 'ng-apexcharts';
import { Bot } from 'src/app/models/bot.model';
import { Game2v2 } from 'src/app/models/game.model';
import { GameAdditionalData } from 'src/app/models/game.stats';
import { Team } from 'src/app/models/team.model';
import { BotSelector } from '../round-table/round-table.component';


export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  plotOptions: ApexPlotOptions,
  xaxis: ApexXAxis,
  dataLabels: ApexDataLabels;
  colors: string[],
  tooltip: ApexTooltip,
  title: ApexTitleSubtitle,
};

@Component({
  selector: 'app-game-charts-panel',
  templateUrl: './game-charts-panel.component.html',
  styleUrls: ['./game-charts-panel.component.sass']
})
export class GameChartsPanelComponent {
  @Input() public team: Team | undefined;
  @Input() public game: Game2v2 | undefined;
  @Input() public gameData: GameAdditionalData | undefined;
  @Input() public bots: Bot[] = [];

  public generalCharts: ChartOptions[] = [];
  public lossesCharts: ChartOptions[] = [];
  public defenseCharts: ChartOptions[] = [];
  public attackCharts: ChartOptions[] = [];

  normalizedMetrics: string[] = [

  ]

  ngOnInit(): void {
    this.setupCharts();
  }

  private setupCharts(): void {
    if (this.gameData) {


      this.generalCharts = [
        "turns_played",
        "total_troops_generated",
        "fleet_generated",
        "num_fleet_generated",
      ].map((m: string) => this.generateConfig(m))
      .filter((chartConfig): chartConfig is ChartOptions => chartConfig !== undefined);;

      this.lossesCharts = [
        "fleet_lost",
        "num_fleet_lost",
        "largest_loss",
        "planets_lost",
      ].map((m: string) => this.generateConfig(m))
      .filter((chartConfig): chartConfig is ChartOptions => chartConfig !== undefined);;

      this.defenseCharts = [
        "fleet_reinforced",
        "num_fleet_reinforced",
        "largest_reinforcement",
        "planets_defended",
      ].map((m: string) => this.generateConfig(m))
      .filter((chartConfig): chartConfig is ChartOptions => chartConfig !== undefined);;

      this.attackCharts = [
        "largest_attack",
        "planets_conquered",
        "planets_attacked",

      ].map((m: string) => this.generateConfig(m))
      .filter((chartConfig): chartConfig is ChartOptions => chartConfig !== undefined);;
    }
  }

  generateConfig = (metric: string) => {
    if (!this.gameData) {
      return;
    }
    if (!this.gameData.team1bot1) {
      return;
    }
    if (!this.gameData.team1bot2) {
      return;
    }
    if (!this.gameData.team2bot1) {
      return;
    }
    if (!this.gameData.team2bot2) {
      return;
    }
    let team1bot1 = this.gameData.team1bot1 as any;
    let team1bot2 = this.gameData.team1bot2 as any;
    let team2bot1 = this.gameData.team2bot1 as any;
    let team2bot2 = this.gameData.team2bot2 as any;


    let data = [
      team1bot1[metric],
      team1bot2[metric],
      team2bot1[metric],
      team2bot2[metric]
    ]

    if (this.normalizedMetrics.includes(metric)) {
      data[0] = data[0] / team1bot1.turns_played;
      data[1] = data[1] / team1bot2.turns_played;
      data[2] = data[2] / team2bot1.turns_played;
      data[3] = data[3] / team2bot2.turns_played;
    }

    const seriesData = [
      {
        name: metric,
        data: data
      },
    ];
    console.log(seriesData);
    const chartConfig: ChartOptions = {
      series: seriesData,
      chart: {
        type: 'bar',
        height: 350,
        foreColor: "#c0c0c0"
      },
      plotOptions: {
        bar: {
          dataLabels: {
            position: "top", // top, center, bottom
          },
        }
      },
      xaxis: {
        labels: {
          rotate: -45
        },
        categories: this.getBotLabels()
      },
      dataLabels: {
        enabled: false,
        style: {
          colors: ["#FFF"]
        }
      },
      tooltip: {
        enabled: true
      },
      colors: [this.getChartColor(metric)],
      title: {
        text: metric.split("_").join(" "),
        offsetY: 330,
        align: "center",
        style: {
          color: "#c0c0c0"
        }
      }
    };
    return chartConfig
  }



  private getChartColor(metric: string): string {
    if (metric == "turns_played") return "#0099ff";
    if (metric == "winner") return "";
    if (metric == "fleet_generated") return "#0099ff";
    if (metric == "fleet_lost") return "#b32400";
    if (metric == "fleet_reinforced") return "#00b300";
    if (metric == "largest_attack") return "#e57300";
    if (metric == "largest_loss") return "#b32400";
    if (metric == "largest_reinforcement") return "#00b300";
    if (metric == "planets_lost") return "#b32400";
    if (metric == "planets_conquered") return "#e57300";
    if (metric == "planets_defended") return "#00b300";
    if (metric == "planets_attacked") return "#e57300";
    if (metric == "num_fleet_lost") return "#b32400";
    if (metric == "num_fleet_reinforced") return "#00b300";
    if (metric == "num_fleet_generated") return "#0099ff";
    if (metric == "total_troops_generated") return "#0099ff";
    return ""
  }

  private isTeam1(game: Game2v2): boolean {
    return game.team1_id == this.team?.id
  }

  public getBotLabels(): string[] {
    if (!this.game) {
      return ["bot1", "bot2", "bot3", "bot4"];
    }
    if (this.isTeam1(this.game)) {
      return [
        this.bots.filter(b => b.id == this.game?.team1bot1_id)[0].bot_name,
        this.bots.filter(b => b.id == this.game?.team1bot2_id)[0].bot_name,
        "Enemy Bot 1",
        "Enemy Bot 2"
      ]
    }
    return [
      "Enemy Bot 1",
      "Enemy Bot 2",
      this.bots.filter(b => b.id == this.game?.team2bot1_id)[0].bot_name,
      this.bots.filter(b => b.id == this.game?.team2bot2_id)[0].bot_name,
    ]
  }

  private getBotName(game: Game2v2, bot: BotSelector): string {
    const botId = this.getBotId(game, bot);
    if (!botId) {
      return "Unknown bot"
    }

    return this.bots.filter((b: Bot) => b.id == botId)[0].bot_name;
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

}