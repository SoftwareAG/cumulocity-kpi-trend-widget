/*
* Copyright (c) 2020 Software AG, Darmstadt, Germany and/or its licensors
*
* SPDX-License-Identifier: Apache-2.0
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

import { formatDate } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MeasurementService, Realtime } from '@c8y/ngx-components/api';
import * as _ from 'lodash';
import { Chart } from 'chart.js';

interface Device {
  id: string;
}

interface Measurement {
  name: string;
  fragment: string;
  series: string;
}

interface KPI {
  default: {
    color: string
  }
  title: string;
  icon: string;
  topMargin: string;
  color: string;
  value: number;
  unit: string;
  threshold: {
    enabled: string,
    up: {
      high: number,
      medium: number
    },
    down: {
      high: number,
      medium: number
    },
    color: {
      high: string,
      medium: string
    }
  },
  aggregation: {
    interval: {
      name: string,
      startDatetime: Date,
      endDatetime: Date
    }
  },
  stats: {
    values: number[],
    sum: number,
    count: number,
    average: number,
    percentage: number,
    text: string
  }
}

interface Validation {
  measurement: boolean,
  kpi: {
    threshold: boolean
  }
}

interface Chart {
  enabled: string,
  position: string,
  content: any,
  type: string,
  height: number,
  color: string,
  aggregation: {
    type: string,
    interval: {
      name: string,
      startDatetime: Date,
      endDatetime: Date
    }
    count: number
  },
  data: {
    points: number[],
    labels: string[]
  }
}

@Component({
  selector: 'kpitrend-widget',
  templateUrl: './kpitrend-widget.component.html',
  styles: []
})
export class KPITrendWidget implements OnInit, AfterViewInit, OnDestroy {
  @Input() config;

  private creationTimestamp: number;
  private datetimeFormat: string = 'yyyy-MM-ddTHH:mm:ssZ';
  private maxPageSize: number = 2000;

  private subs: object;

  private device: Device = {
    id: ''
  }

  private measurement: Measurement = {
    name: '',
    fragment: '',
    series: ''
  }

  private kpi: KPI = {
    title: '',
    topMargin: '',
    icon: '',
    value: 0,
    unit: '',
    color: '',
    default: {
      color: ''
    },
    threshold: {
      color: {
        high: '',
        medium: ''
      },
      down: {
        high: 0,
        medium: 0
      },
      up: {
        high: 0,
        medium: 0
      },
      enabled: ''
    },
    aggregation: {
      interval: {
        name: '',
        endDatetime: new Date(),
        startDatetime: new Date()
      }
    },
    stats: {
      average: 0,
      count: 0,
      percentage: 0,
      sum: 0,
      text: '',
      values: []
    }
  }

  private chart: Chart = {
    enabled: '',
    position: '',
    content: {},
    color: '',
    height: 0,
    type: '',
    aggregation: {
      type: '',
      count: 0,
      interval: {
        name: '',
        endDatetime: new Date(),
        startDatetime: new Date()
      }
    },
    data: {
      points: [],
      labels: []
    }
  }

  private validation: Validation = {
    measurement: true,
    kpi: {
      threshold: false
    }
  }

  // constructor()
  constructor(private measurementService: MeasurementService, private realtimeService: Realtime, private elementRef: ElementRef) {}
  
  // ngOnInit()
  async ngOnInit(): Promise<void> {

    // Get Creation Timestamp
    this.creationTimestamp = _.get(this.config, 'customwidgetdata.metadata.creationTimestamp');

    // Get Device Id
    this.device.id = _.get(this.config, 'device.id');
    if(this.device.id === undefined || this.device.id.length === 0) {
      this.validation.measurement = false;
      console.log("Device is not selected. Will not be fetching measurements.");
    }

    // Get KPI Title
    this.kpi.title = _.get(this.config, 'customwidgetdata.metadata.title');
    if(this.kpi.title === undefined || this.kpi.title.length === 0) {
      console.log("KPI Title is blank. Setting KPI Title to the Defaut Title");
      this.kpi.title = "Default Title";
    }

    // Get KPI Icon
    this.kpi.icon = _.get(this.config, 'customwidgetdata.metadata.icon');
    if(this.kpi.icon === undefined || this.kpi.icon.length === 0) {
      console.log("KPI Icon is not uploaded. Setting KPI Icon to default");
      this.kpi.icon = "data:image/png;base64,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";
    }

    // Get Measurement
    this.measurement.name = _.get(this.config, 'customwidgetdata.measurement');
    if(this.measurement.name === undefined || this.measurement.name.length === 0) {
      this.validation.measurement = false;
      console.log("Measurement is not provided. Will not be fetching measurements.");
    } else {
      this.measurement.fragment = this.measurement.name.split(".")[0];
      this.measurement.series = this.measurement.name.split(".")[1];
    }

    // Get KPI Color
    this.kpi.default.color = _.get(this.config, 'customwidgetdata.kpi.color');
    if(this.kpi.default.color === undefined || this.kpi.default.color.indexOf('#') !== 0) {
      console.log("KPI color is blank or does not begin with a #. Default value for KPI color #b0b0b0 is being used.");
      this.kpi.default.color = "#b0b0b0";
    }
    this.kpi.color = this.kpi.default.color;

    // Get KPI Unit
    this.kpi.unit = _.get(this.config, 'customwidgetdata.kpi.unit');

    // Get KPI Threshold Enabled
    this.kpi.threshold.enabled = _.get(this.config, 'customwidgetdata.kpi.threshold.enabled');
    if(this.kpi.threshold.enabled !== undefined && this.kpi.threshold.enabled === 'true') {

      this.validation.kpi.threshold = true;

      // Get KPI Threshold up high
      this.kpi.threshold.up.high = _.get(this.config, 'customwidgetdata.kpi.threshold.up.high');
      if(this.kpi.threshold.up.high === undefined && this.validation.kpi.threshold) {
        this.validation.kpi.threshold = false;
        console.log("KPI Threshold Up High is not defined. KPI threshold checking is disabled.");
      }
       
      // Get KPI Threshold up medium
      this.kpi.threshold.up.medium = _.get(this.config, 'customwidgetdata.kpi.threshold.up.medium');
      if(this.kpi.threshold.up.medium === undefined && this.validation.kpi.threshold) {
        this.validation.kpi.threshold = false;
        console.log("KPI Threshold Up Medium is not defined. KPI threshold checking is disabled.");
      }
      
      //Get KPI Threshold down medium
      this.kpi.threshold.down.medium = _.get(this.config, 'customwidgetdata.kpi.threshold.down.medium');
      if(this.kpi.threshold.down.medium === undefined && this.validation.kpi.threshold) {
        this.validation.kpi.threshold = false;
        console.log("KPI Threshold Down Medium is not defined. KPI threshold checking is disabled.");
      }

      // Get KPI Threshold down high
      this.kpi.threshold.down.high = _.get(this.config, 'customwidgetdata.kpi.threshold.down.high');
      if(this.kpi.threshold.down.high === undefined && this.validation.kpi.threshold) {
        this.validation.kpi.threshold = false;
        console.log("KPI Threshold Down High is not defined. KPI threshold checking is disabled.");
      }

      // Making sure KPI Threshold Up Medium <= KPI Threshold Up High
      if(this.kpi.threshold.up.medium > this.kpi.threshold.up.high && this.validation.kpi.threshold) {
        this.validation.kpi.threshold = false;
        console.log("KPI Threshold Up Medium cannot be greater than KPI Threshold Up High. KPI threshold checking is disabled.");
      }

      // Making sure KPI Threshold Down Medium >= KPI Threshold Down High
      if(this.kpi.threshold.down.medium < this.kpi.threshold.down.high && this.validation.kpi.threshold) {
        this.validation.kpi.threshold = false;
        console.log("KPI Threshold Down Medium cannot be less than KPI Threshold Down High. KPI threshold checking is disabled.");
      }

      // Making sure KPI Threshold Up Medium > KPI Threshold Down Medium
      if(this.kpi.threshold.up.medium <= this.kpi.threshold.down.medium && this.validation.kpi.threshold) {
        this.validation.kpi.threshold = false;
        console.log("KPI Threshold Down Medium cannot be greater than KPI Threshold Up Medium. KPI threshold checking is disabled.");
      }

      // Making sure KPI Threshold Up High > KPI Threshold Down High
      if(this.kpi.threshold.up.high <= this.kpi.threshold.down.high && this.validation.kpi.threshold) {
        this.validation.kpi.threshold = false;
        console.log("KPI Threshold Down High cannot be greater than KPI Threshold Up High. KPI threshold checking is disabled.");
      }

      //Get KPI Threshold high color
      this.kpi.threshold.color.high = _.get(this.config, 'customwidgetdata.kpi.threshold.color.high');
      if(this.kpi.threshold.color.high === undefined || this.kpi.threshold.color.high.indexOf('#') !== 0) {
        console.log("KPI Threshold High color is blank or does not begin with a #.");
        this.kpi.threshold.color.high = "#ff0000";
        console.log("Default value for KPI Threshold High color #ff0000 is being used.");
      }

      //Get KPI Threshold medium color
      this.kpi.threshold.color.medium = _.get(this.config, 'customwidgetdata.kpi.threshold.color.medium');
      if(this.kpi.threshold.color.medium === undefined || this.kpi.threshold.color.medium.indexOf('#') !== 0) {
        console.log("KPI Threshold Medium color is blank or does not begin with a #.");
        this.kpi.threshold.color.medium = "#ffe000";
        console.log("Default value for KPI Threshold Medium color #ffe000 is being used.");
      }

    }

    // Get KPI Aggregation Interval
    this.kpi.aggregation.interval.name = _.get(this.config, 'customwidgetdata.kpi.aggregation.interval');
    if(this.kpi.aggregation.interval.name === undefined || this.kpi.aggregation.interval.name.length === 0) {
      console.log("KPI Aggregation Interval is blank. Setting it to a default value hourly");
      this.kpi.aggregation.interval.name = "hourly";
    }

    // Get Chart Enabled
    this.chart.enabled = _.get(this.config, 'customwidgetdata.chart.enabled');
    if(this.chart.enabled === undefined || this.chart.enabled === '') {
      console.log("Chart enabled is undefined. Setting it to its defaut as true.");
      this.chart.enabled = 'true';
    }

    // Get Chart type
    this.chart.type = _.get(this.config, 'customwidgetdata.chart.type');
    if(this.chart.type === undefined || this.chart.type.length === 0) {
      console.log("Chart type is blank. Setting it to its default type line.");
      this.chart.type = 'line';
    }

    // Get Chart Position
    this.chart.position = _.get(this.config, 'customwidgetdata.chart.position');
    if(this.chart.position === undefined || this.chart.position.length === 0) {
      console.log("Chart position is blank. Setting it to its default positon bottom.");
      this.chart.position = 'bottom';
    }

    // Get Chart Height
    this.chart.height = _.get(this.config, 'customwidgetdata.chart.height');
    if(this.chart.height === undefined) {
      console.log("Chart height is blank. Setting it to default value 100px.");
      this.chart.height = 100;
    }
    
    // Get Chart Color
    this.chart.color = _.get(this.config, 'customwidgetdata.chart.color');
    if(this.chart.color === undefined || this.chart.color.indexOf('#') !== 0) {
      console.log("Chart color is blank or does not begin with a #. Setting it to default value #1776bf.");
      this.chart.color = "#1776bf";
    }

    // Get Chart Aggregation Type
    this.chart.aggregation.type = _.get(this.config, 'customwidgetdata.chart.aggregation.type');
    if(this.chart.aggregation.type === undefined || this.chart.aggregation.type.length <= 0) {
      console.log("Chart aggregation type is blank. Setting to its default value Interval.");
      this.chart.aggregation.type = "interval";
    }

    // Get Chart Aggregation Interval
    this.chart.aggregation.interval.name = _.get(this.config, 'customwidgetdata.chart.aggregation.interval');
    if(this.chart.aggregation.interval.name === undefined || this.chart.aggregation.interval.name.length === 0) {
      console.log("Chart aggregation interval is blank. Setting it to default value hourly.");
      this.chart.aggregation.interval.name = "hourly";
    }

    // Get Chart Aggregation Count
    this.chart.aggregation.count = _.get(this.config, 'customwidgetdata.chart.aggregation.count');
    if(this.chart.aggregation.count === undefined || this.chart.aggregation.count < 1) {
      console.log("Chart aggregation count is blank or less than 1. Will be using the defaut value of 100.");
      this.chart.aggregation.count = 100;
    } else if(this.chart.aggregation.count > this.maxPageSize) {
      console.log("Chart aggregation count is greater than max page size allowed. Setting to 2000.");
      this.chart.aggregation.count = this.maxPageSize;
    }

    // Set KPI Start and End Datetime
    this.kpi.aggregation.interval.startDatetime = this.getStartDatetimeByInterval(this.kpi.aggregation.interval.name);

    // Get measurements if all the inputs are valid
    if(this.validation.measurement) {

      // Get measurements for to calculate KPI
      const kpiMeasurementResponse: any = await this.getMeasurementsByDate(this.device.id, this.measurement.fragment, this.measurement.series, this.kpi.aggregation.interval.startDatetime, this.kpi.aggregation.interval.endDatetime, this.maxPageSize);

      // Calculate KPI information if the measurement response is not empty
      if(kpiMeasurementResponse.data[0] !== undefined) {
        let kpiMeasurementCount = kpiMeasurementResponse.data.length;
        for(let i=0; i<kpiMeasurementCount-2; i++) {
          this.kpi.stats.values.push(kpiMeasurementResponse.data[i][this.measurement.fragment][this.measurement.series].value);
        }

        this.kpi.value = kpiMeasurementResponse.data[0][this.measurement.fragment][this.measurement.series].value;
        // Use the unit value from config if provided. otherwise use from the measurement response
        if(this.kpi.unit === undefined || this.kpi.unit.length === 0) {
          this.kpi.unit = kpiMeasurementResponse.data[0][this.measurement.fragment][this.measurement.series].unit;
        }

        const kpiStats: any = this.calculateStatsForKPI(this.kpi.stats.values, this.kpi.value);
        this.kpi.stats.count = kpiStats.count;
        this.kpi.stats.sum = kpiStats.sum;
        this.kpi.stats.average = kpiStats.average;
        this.kpi.stats.percentage = kpiStats.percentage;
        this.kpi.stats.text = this.calculateKPIText(this.kpi.stats.average, this.kpi.value, this.kpi.aggregation.interval.name);

        if(this.validation.kpi.threshold) {
          this.kpi.color = this.calculateKPIThresholdColor();
        }
      }

      // Chart is enabled
      if(this.chart.enabled === 'true') {
        
        let chartMeasurementResponse: any;
        // Get measurements to show the chart
        if(this.chart.aggregation.type === "count") {
          chartMeasurementResponse = await this.getMeasurements(this.device.id, this.measurement.fragment, this.measurement.series, this.chart.aggregation.count);
        } else {
          if(this.kpi.aggregation.interval.name === this.chart.aggregation.interval.name) {
            chartMeasurementResponse = kpiMeasurementResponse;
          } else {
            chartMeasurementResponse = await this.getMeasurementsByDate(this.device.id, this.measurement.fragment, this.measurement.series, this.kpi.aggregation.interval.startDatetime, this.kpi.aggregation.interval.endDatetime, this.maxPageSize);
          }
        }
  
        // Show chart if the measurement response is not empty
        if(chartMeasurementResponse.data[0] !== undefined) {
  
          for(let i=chartMeasurementResponse.data.length-1; i>0; i--) {
            this.chart.data.points.push(chartMeasurementResponse.data[i][this.measurement.fragment][this.measurement.series].value);
            this.chart.data.labels.push(chartMeasurementResponse.data[i].time);
          }
  
          // Show the Chart in the widget
          this.showChart();
        }
      }

      // Subscribe to reatime measurements
      this.subs = this.realtimeService.subscribe('/measurements/'+this.device.id, (data) => {
        if(_.has(data.data.data[this.measurement.fragment], [this.measurement.series])) {

          this.kpi.stats.values.push(this.kpi.value);
          
          // Update the KPI informaton with this new realtime measurement received
          this.kpi.value = data.data.data[this.measurement.fragment][this.measurement.series].value;
          // Use the unit value from config if provided. otherwise use from the measurement response
          if(this.kpi.unit === undefined || this.kpi.unit.length === 0) {
            this.kpi.unit = data.data.data[this.measurement.fragment][this.measurement.series].unit;
          }
          
          const kpiStats = this.calculateStatsForKPI(this.kpi.stats.values, this.kpi.value);
          this.kpi.stats.count = kpiStats.count;
          this.kpi.stats.sum = kpiStats.sum;
          this.kpi.stats.average = kpiStats.average;
          this.kpi.stats.percentage = kpiStats.percentage;
          this.kpi.stats.text = this.calculateKPIText(this.kpi.stats.average, this.kpi.value, this.kpi.aggregation.interval.name);

          if(this.validation.kpi.threshold && this.kpi.threshold.enabled === 'true') {
            this.kpi.color = this.calculateKPIThresholdColor();
          }
          
          // Chart is enabled
          if(this.chart.enabled === 'true') {
            // Update Chart with this new realtime measurement received
            this.chart.data.points.push(this.kpi.value);
            this.chart.data.labels.push(data.data.data.time);
            if(this.chart.aggregation.type === "count") {
              if(this.chart.data.points.length > this.chart.aggregation.count) {
                this.chart.data.points.shift();
                this.chart.data.labels.shift();
                this.chart.content.update();
              }
            } else {
              this.chart.data.points.shift();
              this.chart.data.labels.shift();
              this.chart.content.update();
            }
          }
        }
      });
    }

  }

  ngAfterViewInit() {
    this.configureTopMarginRequired();
  }

  // Configure top margin within the widget. This is on the basis if the Widget title is set to hidden or not.
  private configureTopMarginRequired(): void {
    let allWidgets: NodeListOf<Element> = document.querySelectorAll('.dashboard-grid-child');
      allWidgets.forEach((w:Element) => {
        let widgetElement: Element = w.querySelector('div > div > div > c8y-dynamic-component > kpitrend-widget');
        if(widgetElement !== undefined && widgetElement !== null) {
          let widgetTitleElement: Element = w.querySelector('div > div > div > c8y-dashboard-child-title');
          const widgetTitleDisplayValue: string = window.getComputedStyle(widgetTitleElement).getPropertyValue('display');
          if(widgetTitleDisplayValue !== undefined && widgetTitleDisplayValue !== null && widgetTitleDisplayValue === 'none') {
            this.kpi.topMargin = '10px';
          } else {
            this.kpi.topMargin = '0';
          }
        }
      });
  }
  
  
  private getStartDatetimeByInterval(interval: string): Date {
    let startDatetime = new Date();

    if(interval === 'hourly') {
      startDatetime.setHours(startDatetime.getHours() - 1);
    } else if(interval === 'daily') {
      startDatetime.setDate(startDatetime.getDate() - 1);
    } else if(interval === 'weekly') {
      startDatetime.setDate(startDatetime.getDate() - 7);
    } else {
      console.log("getStartDatetimeByInterval(): Unable to calculate start date time...");
    }
    return startDatetime;
  }

  private calculateStatsForKPI(measurements: number[], currentMeasurementValue: number): any {
    let stats: any = {
      average: 0,
      sum: 0,
      count: 0,
      percentage: 0
    }

    if(measurements !== undefined && measurements.length > 0) {
      measurements.forEach((value) => {
        stats.sum = stats.sum + value;
        stats.count = stats.count + 1;
      });
    }

    if(stats.count != 0) {
      stats.average = stats.sum / stats.count;
    }

    if(stats.average === 0) {
      stats.percentage = 0;
    } else {
      if(stats.average < currentMeasurementValue) {
        stats.percentage = ((currentMeasurementValue - stats.average) / stats.average) * 100;
      } else if(stats.average > currentMeasurementValue) {
        stats.percentage = ((stats.average - currentMeasurementValue) / stats.average) * 100;
      } else {
        stats.percentage = 0;
      }
    }

    return stats;
  }

  private async getMeasurementsByDate(deviceId: string, measurementFragment: string, measurementSeries: string, dateFrom: Date, dateTo: Date, pageSize: number): Promise<any> {
    const filter = {
      source: deviceId,
      dateFrom: formatDate(dateFrom, this.datetimeFormat, 'en'),
      dateTo: formatDate(dateTo, this.datetimeFormat, 'en'),
      valueFragmentType: measurementFragment,
      valueFragmentSeries: measurementSeries,
      pageSize: pageSize,
      revert: true
    }
    const resp = await this.measurementService.list(filter);
    return resp;
  }

  private async getMeasurements(deviceId: string, measurementFragment: string, measurementSeries: string, pageSize: number): Promise<any> {
    const filter = {
      source: deviceId,
      dateTo: formatDate(new Date(), this.datetimeFormat, 'en'),
      valueFragmentType: measurementFragment,
      valueFragmentSeries: measurementSeries,
      pageSize: pageSize,
      revert: true
    }
    const resp = await this.measurementService.list(filter);
    return resp;
  }

  private calculateKPIText(kpiAverage: number, kpiCurrentValue: number, aggregateInterval: string): string {
    let text: string; 
    if(kpiAverage === 0) {
      if(aggregateInterval === 'hourly') {
        text = "no measurements in last hour";
      } else if(aggregateInterval === 'daily') {
        text = "no measurements in last 24 hours";
      } else if(aggregateInterval === 'weekly') {
        text = "no measurements in last 7 days";
      } else {
        text = "no measurements";
      }
    } else {
      if(kpiAverage < kpiCurrentValue) {
        if(aggregateInterval === 'hourly') {
          text = "% higher than last hour's average";
        } else if(aggregateInterval === 'daily') {
          text = "% higher than last 24 hours average";
        } else if(aggregateInterval === 'weekly') {
          text = "% higher than last 7 days average";
        } else {
          text = "no measurements";
        }
      } else if(kpiAverage > kpiCurrentValue) {
        if(aggregateInterval === 'hourly') {
          text = "% lower than last hour's average";
        } else if(aggregateInterval === 'daily') {
          text = "% lower than last 24 hours average";
        } else if(aggregateInterval === 'weekly') {
          text = "% lower than last 7 days average";
        } else {
          text = "no measurements";
        }
      } else {
        if(aggregateInterval === 'hourly') {
          text = "same as last hour's average";
        } else if(aggregateInterval === 'daily') {
          text = "same as last 24 hours average";
        } else if(aggregateInterval === 'weekly') {
          text = "same as last 7 days average";
        } else {
          text = "no measurements";
        }
      }
    }
    return text;
  }

  private showChart(): void {
    this.chart.content = new Chart(this.getUniqueIdForChart(), {
      type: this.chart.type,
      data: {
        labels: this.chart.data.labels,
        datasets: [
          {
            data: this.chart.data.points,
            backgroundColor: this.chart.color
          }
        ]
      },
      options: {
        legend: {
          display: false
        },
        elements: {
          point: {
            radius: 1
          }
        },
        tooltips: {
          enabled: true
        },
        maintainAspectRatio: false,
        scales: {
          xAxes: [{
            display: false
          }],
          yAxes: [{
            display: false,
            ticks: {
              beginAtZero: true
            }
          }],
        }
      }
    });
  }

  private calculateKPIThresholdColor(): string {
    if(this.kpi.value <= this.kpi.threshold.down.high) {
      return this.kpi.threshold.color.high;
    } else if(this.kpi.value <= this.kpi.threshold.down.medium) {
      return this.kpi.threshold.color.medium;
    } else if(this.kpi.value >= this.kpi.threshold.up.high) {
      return this.kpi.threshold.color.high;
    } else if(this.kpi.value >= this.kpi.threshold.up.medium) {
      return this.kpi.threshold.color.medium;
    } else {
      return this.kpi.default.color;
    }
  }

  // Getter KPI Title 
  public getKPITitle(): string {
    return this.kpi.title;
  }

  // Getter KPI Title Top Margin
  public getKPITitleTopMargin() {
    return this.kpi.topMargin;
  }

  // Getter KPI Icon
  public getKPIIcon(): string {
    return this.kpi.icon;
  }

  // Get KPI Container Height
  public getKPIContainerHeight(): string {
    if(this.chart.enabled === 'true' && this.chart.position === 'right') {
      return (this.chart.height + 25) + 'px'; 
    } else {
      return '90px';
    }
  }

  // Getter KPI Value
  public getKPIValue() {
    return this.kpi.value;
  }

  // Getter KPI Unit
  public getKPIUnit() {
    return this.kpi.unit;
  }

  // Getter KPI Color
  public getKPIColor() {
    return this.kpi.color;
  }

  // Getter KPI Percentage
  public getKPIPercentage() {
    return this.kpi.stats.percentage;
  }

  // Getter KPI Text
  public getKPIText() {
    return this.kpi.stats.text;
  }

  // Getter Chart ID
  public getUniqueIdForChart(): string {
    return 'canvas-' + this.creationTimestamp;
  }

  // Getter Chart Height
  public getChartHeight(): string {
    return this.chart.height + 'px';
  }

  // Get Chart Enabled
  public chartEnabled() {
    return this.chart.enabled;
  }

  // Get Chart Position
  public getChartPosition(): string {
    return this.chart.position;
  }

  ngOnDestroy() {
    if(this.subs !== undefined && this.subs !== null) {
      this.realtimeService.unsubscribe(this.subs);
    }
  }

}