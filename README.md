# KPI Trend Widget for Cumulocity IoT

This widget shows a current measurement value in realtime and a chart based on measurement values as datapoints.

<img src="/assets/img-preview.png" />

> ### ⚠️ This project is no longer under development. Please use [Cumulocity KPI Trend Widget Plugin](https://github.com/SoftwareAG/cumulocity-kpi-trend-widget-plugin) for Application Builder >=2.x.x and Cumulocity >=1016.x.x⚠️
## Features
* Supports measurements from a single device
* Allows color customization for KPI and the trend chart.
* Allows to configure threshold values and do color customization.
* Allows to upload custom image to represent the KPI.
* Supports different chart types.

## Installation - for the dashboards using Runtime Widget Loader
1. Download the latest `kpitrend-widget-{version}.zip` file from the Releases section.
2. Make sure you have Runtime Widget Loader installed on your Cockpit or App Builder app.
3. Open a dashboard.
4. Click `more...`.
5. Select `Install Widget` and follow the instructions.

## Deployment - as part of the Cumulocity IoT Cockpit application
1. Clone the repository on your local machine using `git clone https://github.com/SoftwareAG/cumulocity-kpi-trend-widget.git`.
2. Run `npm install` to install the module dependencies.
3. Run `c8ycli build` to build the cockpit application.
4. Run `c8ycli deploy` and follow the instructions to deploy the cockpit application on your tenant. This will include the widget also.

### Configuration - to view the KPI and trend Chart in the widget
1. Make sure you have successfully installed or deployed the widget.
2. Click on `Add widget`.
3. Choose `KPI Trend` widget.
4. `Title` is the title of widget. Provide a relevant name. You may choose to hide this. Go to `Appearance` tab and choose `Hidden` under `Widget header style`.
5. Select the `device`.
6. `KPI title` is the name of the KPI you want to show. Example: Temperature, Humidity.
7. `Upload KPI icon` allows you to upload relevant icon. Icon should be a image format like .png, jpg, etc.
8. `Measurement` allows you to choose the Fragment and Series combined. It automatically gets populated based on the device selected.
9. `KPI color` is the custom color you may want to specify. Clicking this field opens a color picker to help you selecting a color.
10. `KPI unit` is a unit value you to specify. Providing this value override the value received with measurement. Leave blank if you don't want to override. Examples: km, m, kg, etc.
11. `KPI aggregation enabled` is to calculate and show the percentage tend text statement or not.
12. `KPI aggregation interval` is an interval to choose the measurements from to calculate the KPI.
13. `KPI threshold enabled` and its related fields allows you to configure threshold values. KPI will change its color on reaching the threshold values. Threshold values are inclusive.
14. `Chart enabled` is to show or hide chart in the widget.
15. `Chart type` is the type of the chart you want to see. There are 2 options line and bar.
16. `Chart position` decides where to chart in the widget with respect to the KPI.
17. `Chart height` is the height of the chart you want to configure in pixels.
18. `Chart color` is the color of the chart you want to see. Clicking this field opens a color picker.
19. `Chart aggregation type` is whether you want to retrieve the measurement to be plotted on the chart based on the interval or the custom number.
20. Click `Save` to add the widget on the dashboard.
21. In case you see unexpected results on the widget, refer to browser console to see if there are error logs.

## Development - to do the enhancements and testing locally
1. Clone the repository on local machine using `git clone https://github.com/SoftwareAG/cumulocity-kpi-trend-widget.git`.
2. Run `npm install` to download the module dependencies.
3. Install c8ycli `npm install -g @c8y/cli` if not already.
4. Run `c8ycli server -u https://your_tenant_url` to start the server.
5. Go to `http://localhost:9000/apps/cockpit/` in the browser to view and test your changes.
6. (Optional) push the changes back to this repository.

## Build - to create a new build for the Runtime Widget Loader
1. Finish the development and testing on your local machine.
2. Run `gulp` to start the build process. Run `npm install -g gulp` to install gulp if not already.
3. Use `widget.zip` file in the `dist` folder as a distribution.

------------------------------

These tools are provided as-is and without warranty or support. They do not constitute part of the Software AG product suite. Users are free to use, fork and modify them, subject to the license agreement. While Software AG welcomes contributions, we cannot guarantee to include every contribution in the master project.

------------------------------

For more information you can Ask a Question in the [TECHcommunity Forums](https://tech.forums.softwareag.com/tags/c/forum/1/Cumulocity-IoT).
  
  
You can find additional information in the [Software AG TECHcommunity](https://tech.forums.softwareag.com/tag/Cumulocity-IoT).
