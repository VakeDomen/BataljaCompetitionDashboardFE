import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

import {
  ApexAxisChartSeries,
  ApexChart,
  ApexFill,
  ApexPlotOptions,
  ApexTooltip,
  ApexXAxis,
} from "ng-apexcharts";

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  labels: string[];
  fill: ApexFill,
  stroke: any; // ApexStroke;
  dataLabels: any; // ApexDataLabels;
  plotOptions: ApexPlotOptions;
  tooltip: ApexTooltip,
};

@Component({
  selector: 'app-rounds-chart',
  templateUrl: './rounds-chart.component.html',
  styleUrls: ['./rounds-chart.component.sass']
})
export class RoundsChartComponent implements OnChanges {

  MAX_DISPLAY_ROUNDS = 60;

  @Input() public series1: any[] = [];
  @Input() public labels: string[] = [];
  
  public chartOptions: ChartOptions;

  constructor() { 
    this.chartOptions = {
      series: [
        {
          name: "Round",
          type: "column",
          data: []
        }
      ],
      chart: {
        height: 350,
        type: "line",
        animations: {
          enabled: true,
        },
        zoom: {
          enabled: true,
          type: 'x',  
          autoScaleYaxis: true,  
        },
        foreColor: "#c0c0c0"
      },
      stroke: {
        width: [0, 4]
      },
      fill: {
        type: ['solid'],
        colors: [""]
      },
      dataLabels: {
        enabled: false,
        enabledOnSeries: [1]
      },
      labels: [],
      xaxis: {
        tickAmount: this.MAX_DISPLAY_ROUNDS / 5,
      },
      plotOptions: {
        bar: {
          colors: {
            ranges: [
              {
                from: -10000,
                to: 0,
                color: "#FFAA9E"
              },
              {
                from: 0,
                to: 10000,
                color: "#9ACD32"
              }
            ]
          },
          columnWidth: "80%"
        }
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
    this.chartOptions.series[0].data = this.series1.slice(-this.MAX_DISPLAY_ROUNDS);
    this.chartOptions.labels = this.labels.slice(-this.MAX_DISPLAY_ROUNDS);
  }
}