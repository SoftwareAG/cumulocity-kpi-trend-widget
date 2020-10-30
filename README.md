# Cumulocity IoT KPI Trend Widget
A widget that shows the current measurement in realtime and the chart based on selected time interval.

### Installation - for the dashboards using Runtime Widget Loader
1. Download the latest `kpitrend-widget.zip` file from the Releases section.
2. Make sure you have Runtime Widget Loader installed on your Cockpit or App Builder app.
3. Open a dashboard.
4. Click `more...`.
5. Select `Install Widget` and follow the instructions.

### Deployment - as part of the Cumulocity IoT Cockpit application
1. Clone the repository on your local machine using `git clone https://github.com/SoftwareAG/cumulocity-kpi-trend-widget.git`.
2. Run `npm install` to install the module dependencies.
3. Run `npm run build` to build the cockpit application.
4. Run `npm run deploy` and follow the instructions to deploy the cockpit application on your tenant. This will include the widget also.

### Configuration - to view the KPI and trend Chart in the widget
1. Make sure you have successfully installed or deployed the widget.
2. Click on `Add widget`.
3. Choose `KPI Trend` widget.
4. Select the `device`.
5. Fill in all the fields as required. `Measurement type`, `Measurement fragment type` and `Measurement fragment series` are mandatory fields to view the KPI and trend Chart.
6. Click `Save` to add the widget on dashboard.

### Development - to do the further enhancements locally
1. Clone the repository on local machine using `git clone https://github.com/SoftwareAG/cumulocity-kpi-trend-widget.git`.
2. Run `npm install` to download the module dependencies.
3. Run `npm run start -u https://your_tenant_url` to start the server.
4. Go to `http://localhost:9000/apps/cockpit/` in the browser to view and test your changes.
5. (Optional) push the changes back to this repository.

### Build - to create a new build for the Runtime Widget Loader
1. Finish the development and testing on your local machine.
2. Run `gulp` to start the build process.
3. Use `widget.zip` file in the `dist` folder as a distribution.