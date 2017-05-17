---
title: Part 3 - Creating the view
description: Walks you through the creation of the Bar visualization view.
parent-path: .
parent-title: Create a custom Bar chart visualization using D3
layout: default
---

## Skeleton view code

Create a file named `view-d3.js` and place the following code in it:

```js
define([
  "module",
  "pentaho/visual/base/view",
  "./model",
  "d3"
], function(module, baseViewFactory, barModelFactory, d3) {

  "use strict";

  return function(context) {

    var BaseView = context.get(baseViewFactory);

    var BarView = BaseView.extend({
      type: {
        id: module.id,
        props: [
          {
            name: "model",
            type: barModelFactory
          }
        ]
      },
      
      _updateAll: function() {
        d3.select(this.domContainer).text("Hello World!");
      }
    });

    return BarView;
  };
});
```

Remarks:
  - Defines a visualization view type of id `pentaho/visual/samples/bar/view-d3`.
  - Inherits directly from the base visualization view, 
    [pentaho/visual/base/view]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.base.View'}}).
  - The inherited 
    [model]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.base.View' | append: '#model'}}) 
    property is overridden so that its 
    [type]({{site.refDocsUrlPattern | replace: '$', 'pentaho.type.Property.Type' | append: '#type'}}) 
    is the Bar model you previously created.
  - The [_updateAll]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.base.View' | append: '#_updateAll'}})
    method is where the code that fully renders the visualization must go,
    and, for now, it simply uses D3 to output `"Hello World!"` in the view's DOM element, `domContainer`.

## Installing D3

Execute the following:

```shell
# Add and install the D3 dependency.
npm install d3 --save
# or: yarn add d3
```

## Adapting the HTML sandbox

Edit the `index.html` file and place the following code in it:

```html
<html>
<head>
  <style>
    .pentaho-visual-base {
      border: solid 1px #005da6;
    }
  </style>

  <script type="text/javascript" src="node_modules/RequireJS/require.js"></script>

  <script type="text/javascript" src="node_modules/@nantunes/viz-api/dev-bootstrap.js"></script>

  <script>
    // Needed only in a sandbox environment.
    require.config({
      packages: [
        {
          "name": "pentaho/visual/samples/bar",
          "main": "model",
          "location": "."
        }
      ],
      paths: {
        "d3": "./node_modules/d3/build/d3"
      }
    });
  </script>

  <script>
    require([
      "pentaho/type/Context",
      "pentaho/data/Table",
      "pentaho/visual/base/view",
      "pentaho/visual/samples/bar",
      "json!./sales-by-product-family.json"
    ], function(Context, Table, baseViewFactory, barModelFactory, dataSpec) {

      // Setup up a VizAPI context.
      var context = new Context({application: "viz-api-sandbox"});

      // Create the visualization model.
      var modelSpec = {
        "data": new Table(dataSpec),
        "category": {attributes: ["productFamily"]},
        "measure": {attributes: ["sales"]},
        "barSize": 20
      };

      var BarModel = context.get(barModelFactory);
      var model = new BarModel(modelSpec);

      // Create the visualization view
      var viewSpec = {
        width: 700,
        height: 300,
        domContainer: document.getElementById("viz_div"),
        model: model
      };

      // These are responsibilities of the visualization container application:
      // 1. Mark the container with the model's CSS classes, for styling purposes.
      viewSpec.domContainer.className = model.type.inheritedStyleClasses.join(" ");

      // 2. Set the DOM container dimensions.
      viewSpec.domContainer.style.width = viewSpec.width + "px";
      viewSpec.domContainer.style.height = viewSpec.height + "px";

      // Create the visualization view.
      var BaseView = context.get(baseViewFactory);
      BaseView.createAsync(viewSpec).then(function(view) {
        // Render the visualization.
        view.update();
      });
    });
  </script>
</head>

<body>
  <div id="viz_div"></div>
</body>
</html>
```

Remarks:
  - A script block was added with the AMD/RequireJS configuration of the Bar and D3 packages.
    This step is only needed in a sandbox environment. 
    When inside the Pentaho platform, these configurations are provided automatically,
    built from the web package information.
  - The used visualization model is now `pentaho/visual/samples/bar`.
  - The model now contains visual role mappings for the `category` and `measure` visual roles.
  - The dimensions of the visualization were increased.
  - The `barSize` property is being given a value different from its default.

Now, refresh the `index.html` page in the browser, and you should read `Hello World!`.

## Implementing the render code

Let's now finally implement the rendering of a Bar chart in D3.
To make it easy, we'll adapt the code of following D3 block: 
[https://bl.ocks.org/mbostock/3885304](https://bl.ocks.org/mbostock/3885304).

We'll now go through the view's
[_updateAll]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.base.View' | append: '#_updateAll'}})
code, piece by piece.

### Method `_updateAll`, part 1

In `view-d3.js`, replace the code of the `_updateAll` method with the following:

```js
// view-d3.js
// _updateAll:
function() {
  // Part 1
  
  var model = this.model;
  var dataTable = model.data;
    
  var categoryAttribute = model.category.attributes.at(0).name;
  var measureAttribute = model.measure.attributes.at(0).name;
    
  var categoryColumn = dataTable.getColumnIndexByAttribute(categoryAttribute);
  var measureColumn = dataTable.getColumnIndexByAttribute(measureAttribute);
    
  var scenes = this.__buildScenes(dataTable, categoryColumn, measureColumn);
    
  var container = d3.select(this.domContainer);
    
  // ...
}
```

Remarks:
  - [this.model]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.base.View' | append: '#model'}}) 
    gives you access to the visualization model object.
  - Both the visual roles are required, so it is safe to directly read the first mapped attribute.
  - Most data table methods accept column indexes, so attribute names are converted into column indexes.
  - The data in the data table needs to be converted into an "array of plain objects" form, 
    so that then it can be directly consumed by D3.
  - [this.domContainer]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.base.View' | append: '#domContainer'}})
    gives you access to the DIV where rendering should take place.

Now, you'll make a small detour to create that new `__buildScenes` method.

### Method `__buildScenes`

Add a property `__buildScenes`, after `_updateAll`, and give it the following code:

```js
// view-d3.js
// __buildScenes: 
function(dataTable, categoryColumn, measureColumn) {
  
  var scenes = [];
  
  for(var i = 0, R = dataTable.getNumberOfRows(); i < R; i++) {
    scenes.push({
      category:      dataTable.getValue(i, categoryColumn),
      categoryLabel: dataTable.getFormattedValue(i, categoryColumn),
      measure:       dataTable.getValue(i, measureColumn),
      rowIndex:      i
    });
  }

  return scenes;
}
```

Remarks:
  - Note the data table methods which can be used to traverse it:
    [getNumberOfRows]({{site.refDocsUrlPattern | replace: '$', 'pentaho.data.ITable' | append: '#getNumberOfRows'}}),
    [getValue]({{site.refDocsUrlPattern | replace: '$', 'pentaho.data.ITable' | append: '#getValue'}}) and
    [getFormattedValue]({{site.refDocsUrlPattern | replace: '$', 'pentaho.data.ITable' | append: '#getFormattedValue'}}).
  - In the X axis, you'll be displaying the value of `categoryLabel`, 
    but the value of `category` (and of `rowIndex`) will be useful, later, 
    for adding interactivity to the visualization. 

### Method `_updateAll`, part 2

Having prepared the data for rendering, you'll now add the adapted D3 code:

```js
// view-d3.js
// _updateAll:
function() {
  // Part 1
  // ...
    
  // Part 2
  container.selectAll("*").remove();
  
  var margin = {top: 50, right: 20, bottom: 30, left: 75};

  var width  = this.width  - margin.left - margin.right;
  var height = this.height - margin.top  - margin.bottom;

  var x = d3.scaleBand().rangeRound([0, width]).padding(0.1);
  var y = d3.scaleLinear().rangeRound([height, 0]);

  x.domain(scenes.map(function(d) { return d.categoryLabel; }));
  y.domain([0, d3.max(scenes, function(d) { return d.measure; })]);

  var svg = container.append("svg")
      .attr("width",  this.width)
      .attr("height", this.height);

  // Title
  var title = dataTable.getColumnLabel(measureColumn) +
              " per " +
              dataTable.getColumnLabel(categoryColumn);

  svg.append("text")
      .attr("class", "title")
      .attr("y", margin.top / 2)
      .attr("x", this.width / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .text(title);
  
  // Content
  var g = svg.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // X axis
  g.append("g")
      .attr("class", "axis axis-x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

  // Y axis
  g.append("g")
      .attr("class", "axis axis-y")
      .call(d3.axisLeft(y).ticks(10));

  // Bars
  var bandWidth = x.bandwidth();
  var barWidth  = Math.min(model.barSize, bandWidth);
  var barOffset = bandWidth / 2 - barWidth / 2 + 0.5;

  var bar = g.selectAll(".bar")
      .data(scenes)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d.categoryLabel) + barOffset; })
      .attr("y", function(d) { return y(d.measure); })
      .attr("width", barWidth)
      .attr("height", function(d) { return height - y(d.measure); });
}
```

Remarks:
  - The view dimensions are available through 
    [this.width]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.base.View' | append: '#width'}}) and 
    [this.height]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.base.View' | append: '#height'}}).
  - The chart title is build with the labels of the mapped attributes, by calling 
    [getColumnLabel]({{site.refDocsUrlPattern | replace: '$', 'pentaho.data.ITable' | append: '#getColumnLabel'}}).
  - The Bar model's `barSize` property is being used to limit the width of bars.

Now, refresh the `index.html` page in the browser, and you should finally see a Bar chart!

**Continue** to [Styling the view](part4-view-styling).
