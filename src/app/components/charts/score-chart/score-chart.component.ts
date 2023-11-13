import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexStroke,
  ApexGrid,
  ApexAnnotations,
  ApexTooltip
} from "ng-apexcharts";

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  stroke: ApexStroke;
  xaxis: ApexXAxis;
  // dataLabels: ApexDataLabels;
  grid: ApexGrid;
  colors: string[],
  annotations: ApexAnnotations,
  tooltip: ApexTooltip,
};

export interface Annotation {
  x: number,
  marker: any,
  label: {
    borderColor: string,
    text: string,
  }
}

@Component({
  selector: 'app-score-chart',
  templateUrl: './score-chart.component.html',
  styleUrls: ['./score-chart.component.sass']
})
export class ScoreChartComponent implements OnChanges {

  MAX_DISPLAY_ROUNDS = 60;

  @Input() public series2: any[] = [];
  @Input() public labels: string[] = [];
  @Input() public annotations: any[] = []; 
  
  public chartOptions: ChartOptions;

  constructor() { 
    this.chartOptions = {
      series: [
        {
          name: "Score",
          data: []
        },
      ],
      chart: {
        height: 350,
        type: "line",
        animations: {
          enabled: false,
        },
        zoom: {
          enabled: true,
          type: 'x',  
          autoScaleYaxis: true,  
        },
        foreColor: "#c0c0c0"
      },
      stroke: {
        curve: "smooth"
      },
      // dataLabels: {
      //   enabled: false,
      //   enabledOnSeries: [1]
      // },
      xaxis: {
        tickAmount: this.MAX_DISPLAY_ROUNDS / 5,
        categories: []
      },
      grid: {
        row: {
          colors: ["#353535", "transparent"], // takes an array which will be repeated on columns
          opacity: 0.5
        }
      },
      colors: ["#e57300"],
      annotations: {
        points: [],
      },
      tooltip: {
        theme: 'dark',  // set tooltip theme to dark
        marker: {
          fillColors: ['#c0c0c0'] // setting marker color in tooltip
        },
        x: {
          show: true,
          format: 'dd MMM' // this is just an example format, adjust as needed
        },
        y: {
          title: {
            formatter: function(val) {
              return val;  // adjust as needed
            },
          }
        }
      },
    };
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    this.chartOptions.series[0].data = this.series2.slice(-this.MAX_DISPLAY_ROUNDS);
    this.chartOptions.xaxis.categories = this.labels.slice(-this.MAX_DISPLAY_ROUNDS);
    this.chartOptions.annotations.points = this.annotations.sort((a1: any, a2: any) => +a1.x > +a2.x ? 1 : -1).filter((el: any) => +el.x >= +this.labels[0]);
  }
}