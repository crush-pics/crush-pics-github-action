# Crush.pics Node Client Library

This is the [node.js](http://nodejs.org/) Library for integrating with Crush.pics API. Sign up for a Crush.pics account [here](https://app.crush.pics).

## Installation

Install the latest version of the library with the following command:

```
$ npm i @crush-pics/crush-pics
```

Then require the library:

```
var CrushPics = require('@crush-pics/crush-pics');
```

## Documentation

The full documentation can be found [here](https://docs.crush.pics)

## Get started

In order to perform API calls you need to configure your client - provide your private API token:

```javascript
var CrushPics = require('@crush-pics/crush-pics');

CrushPics.configure({
  api_token: '<your API key>'
});

```

#### Dashboard

Get information about your account and quota consumption report

```javascript
var type = 'week'; # also supports 'month' & 'six_months'

CrushPics.dashboard.get({ report_type: type }).then(function(response) {
  console.log(response);
});
```

Consumption report comes in [ApexCharts.js](https://apexcharts.com/) compatible format.

Example:

```javascript
var renderChart = function(data) {
  // ApexCharts.js initialization options
  var options = {
    chart: {
      height: 350,
      width: '100%',
      type: 'bar',
      stacked: true,
    }
  }
  var report = data.stats.consumption;
  var values = $.map(report.series, function(p, k) {
    return p
  });
  
  options.series = $.map(report.series, function(v, k) {
    return {
      name: window.i18n.origins[k], // customize labels
      data: v
    }
  });
  
  options.xaxis.categories = report.columns;

  var chart = new ApexCharts(
    document.querySelector("#consumption-chart"),
    options
  );

  chart.render();
}

CrushPics.dashboard.get({ report_type: 'week' }).then(function(response) {
  renderChart(result.data);
});
```

#### Async compression

You can send you an image to compression by uploading actual blob or just providing a link to the file

```javascript
CrushPics.original_images
  .create({
    image_url: 'https://example.com/image.jpeg',
    compression_type: 'balanced',
  })
  .then(function(response) {
    console.log(response);
  });
```

```javascript
var file = input.files[0]

CrushPics.original_images
  .create({
    file: file,
    compression_type: 'balanced',
  })
  .then(function(response) {
    console.log(response);
  });
```

#### Sync compression

You can send you an image to compression by uploading actual blob or just providing a link to the file

```javascript
CrushPics.original_images
  .compress({
    image_url: 'https://example.com/image.jpeg',
    compression_type: 'balanced',
  })
  .then(function(response) {
    console.log(response);
  });
```

```javascript
var file = input.files[0]

CrushPics.original_images
  .compress({
    file: file,
    compression_type: 'balanced',
  })
  .then(function(response) {
    console.log(response);
  });
```

#### List uploaded images

```javascript
CrushPics.original_images
  .list()
  .then(function(response) {
    console.log(response);
  });
```

#### Get details of uploaded image

```javascript
CrushPics.original_images
  .get(11)
  .then(function(response) {
    console.log(response);
  });
```

#### Get account details

```javascript
CrushPics.account
  .get()
  .then(function(response) {
    console.log(response);
  });
```

#### Update account details

You can change your account details including default compression settings

```javascript
CrushPics.original_images
  .update({
    compression_level_jpg: 70,
    compression_level_png: 70,
    compression_level_gif: 70,
    compression_type: 'balanced'
  })
  .then(function(response) {
    console.log(response);
  });
```

#### List Callback URLs

```javascript
CrushPics.callback_urls
  .list()
  .then(function(response) {
    console.log(response);
  });
```

#### Create Callback URL

You can change your account details including default compression settings

```javascript
CrushPics.callback_urls
  .create({
    url: 'https://example.com/webhook'
  })
  .then(function(response) {
    console.log(response);
  });
```

#### Delete Callback URL

You can change your account details including default compression settings

```javascript
CrushPics.callback_urls
  .delete(12)
  .then(function(response) {
    console.log(response);
  });
```
