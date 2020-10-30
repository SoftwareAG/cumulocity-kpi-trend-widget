import { Component, Input, OnInit } from '@angular/core';
import * as _ from 'lodash';

@Component({
  selector: 'kpitrend-widget-config',
  templateUrl: './kpitrend-widget-config.component.html'
})
export class KPITrendWidgetConfig implements OnInit {
  @Input() config: any = {};

  widgetInfo = {
    metadata: {
      title: '',
      icon: '',
      creationTimestamp: Date.now()
    },
    measurement: {
      type: '',
      fragment: '',
      series: ''
    },
    aggregation: {
      interval: 'hourly'
    },
    chart: {
      height: 100,
      datapointCount: 100,
      color: '#1776BF'
    }
  }

  ngOnInit() {
    // Editing an existing widget
    if(_.has(this.config, 'customwidgetdata')) {
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

  public updateConfig($event: Event) {
    _.set(this.config, 'customwidgetdata', this.widgetInfo);
  }

}