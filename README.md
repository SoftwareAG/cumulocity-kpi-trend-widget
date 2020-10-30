# Cumulocity IoT KPI Trend Widget
A widget that shows the current measurement in realtime and the chart based on selected time interval.

## Installation - For the dashboards using Runtime Widget Loader
1. Download the latest `kpi-trend-widget.zip` file from the Releases section.
2. Make sure you have Runtime Widget Loader installed on your Cockpit or App Builder app.
3. Open a dashboard.
4. Click `more...`.
5. Select `Install Widget` and follow the instructions.

### Deployment - For the Cumulocity IoT Cockpit application dashboard
1. Clone the repository on your local machine using `git clone https://github.com/SoftwareAG/cumulocity-kpi-trend-widget.git`.
2. Run `npm install` to install the node_modules.
3. Run `npm run build` to build the application.
4. Run `npm run deploy` and follow the instructions to deploy the application on your tenant.

## Build - For the Runtime Widget Loader
1. Clone the repository on local machine using `git clone https://github.com/SoftwareAG/cumulocity-kpi-trend-widget.git`.
2. Run `npm install` to download the module dependencies.
3. Run `gulp` to start the build process.
4. Use `widget.zip` file in the `dist` folder.

## Development - For the development on local machine
1. Clone the repository on local machine using `git clone https://github.com/SoftwareAG/cumulocity-kpi-trend-widget.git`.
2. Run `npm install` to download the module dependencies.
3. Run `npm run start -u 'your tenant url'` to start the server.
4. Go to `http://localhost:9000/apps/cockpit` in the browser.