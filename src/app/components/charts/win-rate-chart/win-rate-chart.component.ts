import { Component, Input, OnChanges, SimpleChanges, } from "@angular/core";

import {
  ApexNonAxisChartSeries,
  ApexPlotOptions,
  ApexChart,
  ApexLegend,
} from "ng-apexcharts";

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  colors: string[];
  legend: ApexLegend;
  plotOptions: ApexPlotOptions;
};

@Component({
  selector: 'app-win-rate-chart',
  templateUrl: './win-rate-chart.component.html',
  styleUrls: ['./win-rate-chart.component.sass']
})
export class WinRateChartComponent implements OnChanges {


  @Input() public series: any[] = [];
  @Input() public labels: string[] = [];

  public chartOptions: ChartOptions;

  constructor() { 
    this.chartOptions = {
      series: [],
      chart: {
        height: 390,
        type: "radialBar"
      },
      plotOptions: {
        radialBar: {
          offsetY: 0,
          startAngle: 0,
          endAngle: 270,
          hollow: {
            margin: 5,
            size: "30%",
            background: "transparent",
            image: undefined
          },
          dataLabels: {
            name: {
              show: false
            },
            value: {
              show: false
            }
          }
        }
      },
      colors: ["#1ab7ea", "#0084ff", "#39539E", "#0077B5"],
      labels: [],
      legend: {
        show: true,
        floating: true,
        fontSize: "16px",
        position: "left",
        offsetX: -30,
        offsetY: 10,
        labels: {
          useSeriesColors: true
        },
        formatter: function(seriesName, opts) {
          return seriesName + ":  " + opts.w.globals.series[opts.seriesIndex] + "%";
        },
        itemMargin: {
          horizontal: 3
        }
      },
    };
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.chartOptions.labels = this.labels;
    this.chartOptions.series = this.series;
  }  
}