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
        type: "radialBar",
        foreColor: "#4e4e4e"
      },
      plotOptions: {
        radialBar: {
          offsetY: 0,
          startAngle: 1,
          endAngle: 360,
          hollow: {
            margin: 5,
            size: "30%",
            background: "transparent",
            image: undefined
          },
          dataLabels: {
            name: {
              show: true
            },
            value: {
              show: true,
              color: "#c0c0c0"
            }
          },
          track: {
            background: '#333',
          }
        },
      },
      colors: ["#f3bb00", "#eea300", "#ea8b00", "#e57300"],
      labels: [],
      legend: {
        show: false,
        floating: true,
        fontSize: "16px",
        position: "left",
        offsetX: 20,
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
    this.filterTopFour();
    this.chartOptions.labels = this.labels;
    this.chartOptions.series = this.series;
  }  
  private filterTopFour(): void {
    // Combine series and labels
    const combined = this.series.map((value, index) => {
      return { value, label: this.labels[index] };
    });
  
    // Sort by value in descending order and keep the top 4
    const sortedAndSliced = combined.sort((a, b) => b.value - a.value).slice(0, 4);
  
    // Separate the values and labels back into their respective arrays
    this.series = sortedAndSliced.map(item => item.value);
    this.labels = sortedAndSliced.map(item => item.label);
  }
}