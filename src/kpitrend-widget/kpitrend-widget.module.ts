import { NgModule } from '@angular/core';
import { CoreModule, HOOK_COMPONENTS } from '@c8y/ngx-components';
import { KPITrendWidget } from './kpitrend-widget.component';
import { KPITrendWidgetConfig } from './kpitrend-widget-config.component';
import { ChartsModule } from 'ng2-charts';
import { HttpClientModule } from '@angular/common/http';
import { ColorPickerComponent } from './color-picker/color-picker-component';
import { ColorSliderComponent } from './color-picker/color-slider/color-slider-component';
import { ColorPaletteComponent } from './color-picker/color-palette/color-palette-component';

@NgModule({
  imports: [
    CoreModule,
    HttpClientModule,
    ChartsModule
  ],
  declarations: [KPITrendWidget, KPITrendWidgetConfig, ColorPickerComponent, ColorSliderComponent, ColorPaletteComponent],
  entryComponents: [KPITrendWidget, KPITrendWidgetConfig],
  providers: [{
    provide: HOOK_COMPONENTS,
    multi: true,
    useValue: 
    {
      id: 'com.softwareag.globalpresales.kpitrendwidget',
      label: 'KPI Trend',
      description: 'This widget shows the latest measurement value and unit received from a device as a KPI. It compares this measurement value with the average of measurements received in the selected interval and calculated the percentage growth or fall. It allows to configure threshold values to change the KPI color when threshold values are reached. It also shows a trend chart by plotting all the measurement values received for the selected interval or measurements count.',
      component: KPITrendWidget,
      configComponent: KPITrendWidgetConfig,
      previewImage: require("~assets/img-preview.png")
    }
  }],
})
export class KPITrendWidgetAppModule {}
