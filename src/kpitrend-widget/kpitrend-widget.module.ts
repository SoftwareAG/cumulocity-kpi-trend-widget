import { NgModule } from '@angular/core';
import { CoreModule, HOOK_COMPONENTS } from '@c8y/ngx-components';
import { KPITrendWidget } from './kpitrend-widget.component';
import { KPITrendWidgetConfig } from './kpitrend-widget-config.component';
import { ChartsModule } from 'ng2-charts';

@NgModule({
  imports: [
    CoreModule,
    ChartsModule
  ],
  declarations: [KPITrendWidget, KPITrendWidgetConfig],
  entryComponents: [KPITrendWidget, KPITrendWidgetConfig],
  providers: [{
    provide: HOOK_COMPONENTS,
    multi: true,
    useValue: [
      {
        id: 'com.softwareag.globalpresales.kpitrendwidget',
        label: 'KPI Trend',
        description: 'This widget shows the current measurement and how its value is in respect to the average value of the measurements for a selection interval. It also shows all the measurements in realtime in the chart.',
        component: KPITrendWidget,
        configComponent: KPITrendWidgetConfig,
        previewImage: require("~assets/img-preview.png")
      }
    ]
  }],
})
export class KPITrendWidgetAppModule {}
