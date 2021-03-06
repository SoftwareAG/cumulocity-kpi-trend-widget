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

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import * as _ from 'lodash';

@Component({
  selector: 'kpitrend-widget-config',
  templateUrl: './kpitrend-widget-config.component.html',
  styleUrls: ['./kpitrend-widget-config.component.css']
})
export class KPITrendWidgetConfig implements OnInit {
  @Input() config: any = {};
  
  oldDeviceId: string = '';
  chartColorPickerClosed: boolean = true;
  kpiColorPickerClosed : boolean = true;
  kpiThresholdHighColorPickerClosed: boolean = true;
  kpiThresholdMediumColorPickerClosed: boolean = true;

  public supportedSeries: string[];
  public measurementSeriesDisabled: boolean = false;

  widgetInfo = {
    metadata: {
      title: '',
      icon: '',
      creationTimestamp: Date.now()
    },
    measurement: '',
    kpi: {
      color: '#b0b0b0',
      unit: '',
      aggregation: {
        interval: 'hourly'
      },
      threshold: {
        enabled: 'false',
        up: {
          high: 10,
          medium: 10
        },
        down: {
          high: 10,
          medium: 10
        },
        color :  {
          high: '#ff0000',
          medium: '#ffe000'
        }
      }
    },
    chart: {
      enabled: 'true',
      type: 'line',
      position: 'bottom',
      height: 100,
      aggregation: {
        type: 'interval',
        interval: 'hourly',
        count: 100
      },
      color: '#1776bf'
    }
  }

  constructor(private http: HttpClient) {}

  async ngOnInit() {
    // Editing an existing widget
    if(_.has(this.config, 'customwidgetdata')) {
      this.loadFragmentSeries();
      this.widgetInfo = _.get(this.config, 'customwidgetdata');
    } else { // Adding a new widget
      _.set(this.config, 'customwidgetdata', this.widgetInfo);
    }
  }

  public updateIconInConfig($event: Event) {
    const kpiIcon = ($event.target as HTMLInputElement).files[0];
    const reader = new FileReader();
    reader.readAsDataURL(kpiIcon);
    reader.onload = () => {
        this.widgetInfo.metadata.icon = reader.result as string;
        _.set(this.config, 'customwidgetdata', this.widgetInfo);
    };
  }

  public updateConfig() {
    if(this.widgetInfo.kpi.threshold.enabled === 'false') {
      this.kpiThresholdHighColorPickerClosed = true;
      this.kpiThresholdMediumColorPickerClosed = true;
    }
    _.set(this.config, 'customwidgetdata', this.widgetInfo);
  }

  public async loadFragmentSeries(): Promise<void> {
    if( !_.has(this.config, "device.id")) {
      console.log("Cannot get fragment series because device id is blank.");
    } else {
      if(this.oldDeviceId !== this.config.device.id) {
        this.measurementSeriesDisabled = true
        const base64Auth: string = sessionStorage.getItem('_tcy8');
        let headersObject = new HttpHeaders();
        if(base64Auth === undefined || base64Auth.length === 0) {
          console.log("Authorization details not found in session storage.");
        } else {
          headersObject = headersObject.append('Authorization', 'Basic '+base64Auth);
        }
        let httpOptions = {headers: headersObject};
        let supportedSeriesResp: any = await this.http.get('/inventory/managedObjects/'+ this.config.device.id +'/supportedSeries', {...httpOptions}).toPromise();
        this.measurementSeriesDisabled = false;
        if(supportedSeriesResp !== undefined) {
          this.supportedSeries = supportedSeriesResp.c8y_SupportedSeries;
        }
        this.oldDeviceId = this.config.device.id;
      }
    }
  }

  setSelectedColorForKPI(value: string) {
    this.widgetInfo.kpi.color = value;
    this.updateConfig();
  }

  closeKPIColorPicker() {
    this.kpiColorPickerClosed = true;
  }

  openKPIColorPicker() {
    this.kpiColorPickerClosed = false;
  }

  setSelectedColorForChart(value: string) {
    this.widgetInfo.chart.color = value;
    this.updateConfig();
  }

  closeChartColorPicker() {
    this.chartColorPickerClosed = true;
  }

  openChartColorPicker() {
    this.chartColorPickerClosed = false;
  }

  setSelectedColorForKPIThresholdHigh(value: string) {
    this.widgetInfo.kpi.threshold.color.high = value;
    this.updateConfig();
  }

  closeKPIThresholdHighColorPicker() {
    this.kpiThresholdHighColorPickerClosed = true;
  }

  openKPIThresholdHighColorPicker() {
    this.kpiThresholdHighColorPickerClosed = false;
  }

  setSelectedColorForKPIThresholdMedium(value: string) {
    this.widgetInfo.kpi.threshold.color.medium = value;
    this.updateConfig();
  }

  closeKPIThresholdMediumColorPicker() {
    this.kpiThresholdMediumColorPickerClosed = true;
  }

  openKPIThresholdMediumColorPicker() {
    this.kpiThresholdMediumColorPickerClosed = false;
  }

}