import { formatDate } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MeasurementService, Realtime } from '@c8y/ngx-components/api';
import * as _ from 'lodash';
import { Chart } from 'chart.js';

@Component({
  selector: 'kpitrend-widget',
  templateUrl: './kpitrend-widget.component.html',
  styles: []
})
export class KPITrendWidget implements OnInit {
  @Input() config;

  // Used internally only
  private creationTimestamp: number;
  private datetimeFormat: string = 'yyyy-MM-ddTHH:mm:ssZ';
  private oldStartDatetime: Date;
  private oldEndDatetime: Date;
  private totalMeasurementsSum: number = 0;
  private totalMeasurementsCount: number = 0;
  private allDataPoints = [];
  private chartDataPoints = [];
  private chartLabels = [];
  private lineChart;
  private chartDatapointsCount: number = 0;
  private kpiColorDefault: string;
  private kpiThresholdEnabled = false;
  private kpiThresholdHighColor: string;
  private kpiThresholdMediumColor: string;
  private kpiThresholdUpHigh: number;
  private kpiThresholdUpMedium: number;
  private kpiThresholdDownHigh: number;
  private kpiThresholdDownMedium: number;

  // Got public getters
  private kpiTitle: string = '';
  private kpiIcon: string = '';
  private kpiColor: string = '';
  private chartHeight: string = '';
  private chartColor: string = '';
  
  // Used publiclly
  public totalPercentage: number = 0;
  public txt: string = '';
  public currentMeasurementValue: number = 0;
  public currentMeasurementUnit: string = '';
  

  constructor(private measurementService: MeasurementService, private realtimeService: Realtime) {}

  private setOldDatetime(interval: string) {
    this.oldStartDatetime = new Date();
    this.oldEndDatetime = new Date();
    if(interval === 'hourly') {
      this.oldStartDatetime.setHours(this.oldStartDatetime.getHours() - 1);
    } else if(interval === 'daily') {
      this.oldStartDatetime.setDate(this.oldStartDatetime.getDate() - 1);
    } else if(interval === 'weekly') {
      this.oldStartDatetime.setDate(this.oldStartDatetime.getDate() - 7);
    } else {
      console.log("Unable to set old date time...");
    }
  }

  private calculateMeasurementsAverage() {
    let measurementAverage: number = 0;
    this.totalMeasurementsSum = 0;
    this.totalMeasurementsCount = 0;

    if(this.allDataPoints !== undefined && this.allDataPoints.length > 0) {
      this.allDataPoints.forEach((dataPoint) => {
        this.totalMeasurementsSum = this.totalMeasurementsSum + dataPoint;
        this.totalMeasurementsCount = this.totalMeasurementsCount + 1;
      });
    }

    if(this.totalMeasurementsCount != 0) {
      measurementAverage = this.totalMeasurementsSum / this.totalMeasurementsCount;
    }
    return measurementAverage;
  }

  private async getMeasurements(deviceId: string, measurementType: string, measurementFragment: string, measurementSeries: string, dateFrom: Date, dateTo: Date, ): Promise<any> {
    const filter = {
      source: deviceId,
      type: measurementType,
      dateFrom: formatDate(this.oldStartDatetime, this.datetimeFormat, 'en'),
      dateTo: formatDate(this.oldEndDatetime, this.datetimeFormat, 'en'),
      valueFragmentType: measurementFragment,
      valueFragmentSeries: measurementSeries,
      pageSize: 2000
    }
    const resp = await this.measurementService.list(filter);
    return resp;
  }

  private setPercentageAndText(measurementAverage: number, currentMeasurementValue: number, aggregateInterval: string): void {
    if(measurementAverage === 0) {
      if(aggregateInterval === 'hourly') {
        this.txt = "no measurements in last hour";
      } else if(aggregateInterval === 'daily') {
        this.txt = "no measurements in last 24 hours";
      } else if(aggregateInterval === 'weekly') {
        this.txt = "no measurements in last 7 days";
      } else {
        this.txt = "no measurements";
      }
    } else {
      if(measurementAverage < currentMeasurementValue) {
        this.totalPercentage = ((currentMeasurementValue - measurementAverage) / measurementAverage) * 100;
        if(aggregateInterval === 'hourly') {
          this.txt = "% higher than last hour's average";
        } else if(aggregateInterval === 'daily') {
          this.txt = "% higher than last 24 hours average";
        } else if(aggregateInterval === 'weekly') {
          this.txt = "% higher than last 7 days average";
        } else {
          this.txt = "no measurements";
        }
      } else if(measurementAverage > currentMeasurementValue) {
        this.totalPercentage = ((measurementAverage - currentMeasurementValue) / measurementAverage) * 100;
        if(aggregateInterval === 'hourly') {
          this.txt = "% lower than last hour's average";
        } else if(aggregateInterval === 'daily') {
          this.txt = "% lower than last 24 hours average";
        } else if(aggregateInterval === 'weekly') {
          this.txt = "% lower than last 7 days average";
        } else {
          this.txt = "no measurements";
        }
      } else {
        this.totalPercentage = 0;
        if(aggregateInterval === 'hourly') {
          this.txt = "same as last hour's average";
        } else if(aggregateInterval === 'daily') {
          this.txt = "same as last 24 hours average";
        } else if(aggregateInterval === 'weekly') {
          this.txt = "same as last 7 days average";
        } else {
          this.txt = "no measurements";
        }
      }
    }
  }

  async ngOnInit(): Promise<void> {

    let allSetToGetMeasurements: boolean = true;

    // Get Creation Timestamp
    this.creationTimestamp = _.get(this.config, 'customwidgetdata.metadata.creationTimestamp');

    // Get Device Id
    const deviceId: string = _.get(this.config, 'device.id');
    if(deviceId === undefined || deviceId.length === 0) {
      allSetToGetMeasurements = false;
      console.log("Device is not selected. Will not be fetching any measurements.");
    }

    // Get Measurement Type
    const measurementType: string = _.get(this.config, 'customwidgetdata.measurement.type');
    if(measurementType === undefined || measurementType.length === 0) {
      allSetToGetMeasurements = false;
      console.log("Measurement type is not provided. Will not be fetching any measurements.");
    }

    // Get Measurement Fragment Type
    const measurementFragmentType: string = _.get(this.config, 'customwidgetdata.measurement.fragment');
    if(measurementFragmentType === undefined || measurementFragmentType.length === 0) {
      allSetToGetMeasurements = false;
      console.log("Measurement fragment type is not provided. Will not be fetching any measurements.");
    }

    // Get Measurement Fragement Series
    const measurementFragmentSeries: string = _.get(this.config, 'customwidgetdata.measurement.series');
    if(measurementFragmentSeries === undefined || measurementFragmentSeries.length ===0) {
      allSetToGetMeasurements = false;
      console.log("Measurement fragment series is not provided. Will not be fetching any measurements.");
    }

    // Get Measurement Color
    this.kpiColorDefault = _.get(this.config, 'customwidgetdata.measurement.color');
    if(this.kpiColorDefault === undefined || this.kpiColorDefault.indexOf('#') !== 0) {
      console.log("KPI color is blank or does not begin with a #.");
      this.kpiColorDefault = "#B0B0B0";
      console.log("Default value for KPI color #B0B0B0 is being used.");
    }
    this.kpiColor = this.kpiColorDefault;


    // Get Threshold Enabled
    let measurementThresholdEnabled: string = _.get(this.config, 'customwidgetdata.measurement.threshold.enabled');
    if(measurementThresholdEnabled !== undefined && measurementThresholdEnabled === 'true') {

      this.kpiThresholdEnabled = true;

      // Get Threshold up high
      this.kpiThresholdUpHigh = _.get(this.config, 'customwidgetdata.measurement.threshold.up.high');
      if(this.kpiThresholdUpHigh === undefined && this.kpiThresholdEnabled) {
        this.kpiThresholdEnabled = false;
        console.log("Measurement Threshold Up High is not defined. Measurment threshold checking is disabled.");
      }
       
      //Get Threshold up medium
      this.kpiThresholdUpMedium = _.get(this.config, 'customwidgetdata.measurement.threshold.up.medium');
      if(this.kpiThresholdUpMedium === undefined && this.kpiThresholdEnabled) {
        this.kpiThresholdEnabled = false;
        console.log("Measurement Threshold Up Medium is not defined. Measurment threshold checking is disabled.");
      }
      
      //Get Threshold down medium
      this.kpiThresholdDownMedium = _.get(this.config, 'customwidgetdata.measurement.threshold.down.medium');
      if(this.kpiThresholdDownMedium === undefined && this.kpiThresholdEnabled) {
        this.kpiThresholdEnabled = false;
        console.log("Measurement Threshold Down Medium is not defined. Measurment threshold checking is disabled.");
      }

      // Get Threshold down high
      this.kpiThresholdDownHigh = _.get(this.config, 'customwidgetdata.measurement.threshold.down.high');
      if(this.kpiThresholdDownHigh === undefined && this.kpiThresholdEnabled) {
        this.kpiThresholdEnabled = false;
        console.log("Measurement Threshold Down High is not defined. Measurment threshold checking is disabled.");
      }

      // Making sure Measurement Threshold Up Medium <= Measurement Threshold Up High
      if(this.kpiThresholdUpMedium > this.kpiThresholdUpHigh && this.kpiThresholdEnabled) {
        this.kpiThresholdEnabled = false;
        console.log("Measurement Threshold Up Medium cannot be greater than Measurement Threshold Up High. Measurment threshold checking is disabled.");
      }

      // Making sure Measurement Threshold Down Medium >= Measurement Threshold Down High
      if(this.kpiThresholdDownMedium < this.kpiThresholdDownHigh && this.kpiThresholdEnabled) {
        this.kpiThresholdEnabled = false;
        console.log("Measurement Threshold Down Medium cannot be less than Measurement Threshold Down High. Measurment threshold checking is disabled.");
      }

      // Making sure Measurement Threshold Up Medium > Measurement Threshold Down Medium
      if(this.kpiThresholdUpMedium <= this.kpiThresholdDownMedium && this.kpiThresholdEnabled) {
        this.kpiThresholdEnabled = false;
        console.log("Measurement Threshold Down Medium cannot be greater than Measurment Threshold Up Medium. Measurment threshold checking is disabled.");
      }

      // Making sure Measurement Threshold Up High > Measurement Threshold Down High
      if(this.kpiThresholdUpHigh <= this.kpiThresholdDownHigh && this.kpiThresholdEnabled) {
        this.kpiThresholdEnabled = false;
        console.log("Measurement Threshold Down High cannot be greater than Measurment Threshold Up High. Measurment threshold checking is disabled.");
      }

      //Get Threshold high color
      this.kpiThresholdHighColor = _.get(this.config, 'customwidgetdata.measuremnt.threshold.color.high');
      if(this.kpiThresholdHighColor === undefined || this.kpiThresholdHighColor.indexOf('#') !== 0) {
        console.log("Measurement Threshold High color is blank or does not begin with a #.");
        this.kpiThresholdHighColor = "#FF0000";
        console.log("Default value for Measurement Threshold High color #FF0000 is being used.");
      }

      //Get Threshold medium color
      this.kpiThresholdMediumColor = _.get(this.config, 'customwidgetdata.measuremnt.threshold.color.medium');
      if(this.kpiThresholdMediumColor === undefined || this.kpiThresholdMediumColor.indexOf('#') !== 0) {
        console.log("Measurement Threshold Medium color is blank or does not begin with a #.");
        this.kpiThresholdMediumColor = "#FFE000";
        console.log("Default value for Measurement Threshold Medium color #FFE000 is being used.");
      }

    }

    // Get KPI Title
    this.kpiTitle = _.get(this.config, 'customwidgetdata.metadata.title');
    if(this.kpiTitle === undefined || this.kpiTitle.length === 0) {
      console.log("KPI Title is blank.");
      this.kpiTitle = "Default Title";
      console.log("Setting KPI Title to the Default Title.");
    }

    // Get KPI Icon
    this.kpiIcon = _.get(this.config, 'customwidgetdata.metadata.icon');
    if(this.kpiIcon === undefined || this.kpiIcon.length === 0) {
      console.log("KPI Icon is not uploaded.");
      this.kpiIcon = "data:image/png;base64,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";
      console.log("Setting KPI Icon to default.");
    }

    // Get Aggregation Interval
    const aggregationInterval: string = _.get(this.config, 'customwidgetdata.aggregation.interval');

    // Get Chart Height
    const chartHeight: number = _.get(this.config, 'customwidgetdata.chart.height');
    if(chartHeight !== undefined && chartHeight > 0) {
      this.chartHeight = chartHeight + 'px';
    } else {
      console.log("Chart height is blank or less than 0.");
      this.chartHeight = '100px';
      console.log("Default value for chart height 100px is being used.");
    }
    
    // Get Chart Color
    this.chartColor = _.get(this.config, 'customwidgetdata.chart.color');
    if(this.chartColor === undefined || this.chartColor.indexOf('#') !== 0) {
      console.log("Chart color is blank or does not begin with a #.");
      this.chartColor = "#1776BF";
      console.log("Deafult value for chart color #1776BF is being used.");
    }

    // Get Chart Datapoints Count
    this.chartDatapointsCount = _.get(this.config, 'customwidgetdata.chart.datapointCount');
    if(this.chartDatapointsCount === undefined || this.chartDatapointsCount < 1) {
      console.log("Chart datapoints count is blank or less than 1. Will be using the defaut value of 100.");
      this.chartDatapointsCount = 100;
    }

    this.setOldDatetime(aggregationInterval);

    if(allSetToGetMeasurements) {
      const oldMeasurementsResponse: any = await this.getMeasurements(deviceId, measurementType, measurementFragmentType, measurementFragmentSeries, this.oldStartDatetime, this.oldEndDatetime);
      if(oldMeasurementsResponse.data[0] !== undefined) {
        oldMeasurementsResponse.data.forEach((data) => {
          this.allDataPoints.push(data[measurementFragmentType][measurementFragmentSeries].value);
        });

        let oldMeasurementsAverage: number = this.calculateMeasurementsAverage();

        this.currentMeasurementValue = this.allDataPoints[this.totalMeasurementsCount - 1];
        this.currentMeasurementUnit = oldMeasurementsResponse.data[this.totalMeasurementsCount - 1][measurementFragmentType][measurementFragmentSeries].unit;
        this.setPercentageAndText(oldMeasurementsAverage, this.currentMeasurementValue, aggregationInterval);

        if(this.kpiThresholdEnabled) {
          this.setThresholdColorForKPI();
        }
      }
    }

    if(this.chartDatapointsCount > this.allDataPoints.length) {
      for(let i=0; i<this.allDataPoints.length; i++) {
        this.chartDataPoints.push(this.allDataPoints[i]);
        this.chartLabels.push("-");
      }
    } else {
      for(let i=0; i<this.chartDatapointsCount; i++) {
        this.chartDataPoints.push(this.allDataPoints[this.allDataPoints.length - this.chartDatapointsCount + i]);
        this.chartLabels.push("-");
      }
    }

    this.lineChart = new Chart(this.getUniqueIdForChart(), {
      type: 'line',
      data: {
        labels: this.chartLabels,
        datasets: [
          {
            data: this.chartDataPoints,
            backgroundColor: this.chartColor
          }
        ]
      },
      options: {
        legend: {
          display: false
        },
        elements: {
          point: {
            radius: 0
          }
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

    this.realtimeService.subscribe('/measurements/'+deviceId, (data) => {
      if(data.data.data[measurementFragmentType][measurementFragmentSeries] !== undefined && data.data.data.type === measurementType) {
        this.currentMeasurementValue = data.data.data[measurementFragmentType][measurementFragmentSeries].value;
        this.currentMeasurementUnit = data.data.data[measurementFragmentType][measurementFragmentSeries].unit;
        this.allDataPoints.push(this.currentMeasurementValue);
        let oldMeasurementsAverage = this.calculateMeasurementsAverage();
        this.setPercentageAndText(oldMeasurementsAverage, this.currentMeasurementValue, aggregationInterval);

        if(this.kpiThresholdEnabled) {
          this.setThresholdColorForKPI();
        }

        this.chartDataPoints.push(this.currentMeasurementValue);
        this.chartLabels.push("-");
        if(this.chartDataPoints.length > this.chartDatapointsCount) {
          this.chartDataPoints.shift();
          this.chartLabels.shift();
        }
        this.lineChart.update();
      }
    });

  }

  private setThresholdColorForKPI(): void {
    if(this.currentMeasurementValue <= this.kpiThresholdDownHigh) {
      this.kpiColor = this.kpiThresholdHighColor;
    } else if(this.currentMeasurementValue <= this.kpiThresholdDownMedium) {
      this.kpiColor = this.kpiThresholdMediumColor;
    } else if(this.currentMeasurementValue >= this.kpiThresholdUpHigh) {
      this.kpiColor = this.kpiThresholdHighColor;
    } else if(this.currentMeasurementValue >= this.kpiThresholdUpMedium) {
      this.kpiColor = this.kpiThresholdMediumColor;
    } else {
      this.kpiColor = this.kpiColorDefault;
    }
  }

  public getKPIIcon(): string {
    return this.kpiIcon;
  }

  public getKPITitle(): string {
    return this.kpiTitle;
  }

  public getChartHeight(): string {
    return this.chartHeight;
  }

  public getKPIColor() {
    return this.kpiColor;
  }

  public getUniqueIdForChart(): string {
    return 'canvas-' + this.creationTimestamp;
  }

}