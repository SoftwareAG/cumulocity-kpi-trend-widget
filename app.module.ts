import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule as NgRouterModule } from '@angular/router';
import { UpgradeModule as NgUpgradeModule } from '@angular/upgrade/static';
import { CoreModule, HOOK_COMPONENTS } from '@c8y/ngx-components';
import {
  DashboardUpgradeModule,
  UpgradeModule,
  HybridAppModule,
  UPGRADE_ROUTES
} from '@c8y/ngx-components/upgrade';
import { AssetsNavigatorModule } from '@c8y/ngx-components/assets-navigator';
import { CockpitDashboardModule } from '@c8y/ngx-components/context-dashboard';
import { ReportsModule } from '@c8y/ngx-components/reports';
import { SensorPhoneModule } from '@c8y/ngx-components/sensor-phone';
import { KPITrendWidget } from './src/kpitrend-widget/kpitrend-widget.component';
import { KPITrendWidgetConfig } from './src/kpitrend-widget/kpitrend-widget-config.component';
import { ChartsModule } from 'ng2-charts';
import { ColorPaletteComponent } from './src/kpitrend-widget/color-picker/color-palette/color-palette-component';
import { ColorSliderComponent } from './src/kpitrend-widget/color-picker/color-slider/color-slider-component';
import { ColorPickerComponent } from './src/kpitrend-widget/color-picker/color-picker-component';
import { DatePipe } from '@angular/common';

@NgModule({
  imports: [
    BrowserAnimationsModule,
    NgRouterModule.forRoot([...UPGRADE_ROUTES], { enableTracing: false, useHash: true }),
    CoreModule.forRoot(),
    AssetsNavigatorModule,
    ReportsModule,
    NgUpgradeModule,
    DashboardUpgradeModule,
    CockpitDashboardModule,
    SensorPhoneModule,
    UpgradeModule,
    ChartsModule
  ],
  declarations: [KPITrendWidget, KPITrendWidgetConfig, ColorPickerComponent, ColorSliderComponent, ColorPaletteComponent],
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
        previewImage: require("./assets/img-preview.png")
      }
    ]
  }, DatePipe],
})
export class AppModule extends HybridAppModule {
  constructor(protected upgrade: NgUpgradeModule) {
    super();
  }
}
