---
title: Step 3 - Creating the view
description: Walks you through the creation of the Bar visualization view.
parent-path: .
parent-title: Bar/D3 Visualization in Sandbox
grand-parent-title: Create a Custom Visualization
grand-parent-path: ../../create
grand-grand-parent-title: Visualization API
grand-grand-parent-path: ../..
layout: default
---

## Skeleton view code

Create a file named `ViewD3.js` and place the following code in it:

```js
define([
  "pentaho/module!_",
  "pentaho/visual/base/View",
  "./Model",
  "d3",
  "pentaho/visual/scene/Base"
], function(module, BaseView, BarModel, d3, Scene) {
  
  "use strict";

  // Create and return the Bar View class
  return BaseView.extend({
    $type: {
      id: module.id,
      props: [
        // Specialize the inherited model property to the Bar model type
        {
          name: "model",
          valueType: BarModel
        }
      ]
    },
  
    _updateAll: function() {
      d3.select(this.domContainer).text("Hello World!");
    }
  })
  .configure({$type: module.config});
});
```

Remarks:
  - Defines a visualization view whose id is the file's AMD module identifier
    (depending on how AMD is configured, it can be, for example: `pentaho-visual-samples-bar-d3/ViewD3`).
  - Inherits directly from the base visualization view, 
    [pentaho/visual/base/View]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.base.View'}}).
  - The inherited 
    [model]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.base.View' | append: '#model'}}) 
    property is overridden so that its 
    [valueType]({{site.refDocsUrlPattern | replace: '$', 'pentaho.type.PropertyType' | append: '#valueType'}}) 
    is the Bar model you previously created.
  - The [_updateAll]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.base.View' | append: '#_updateAll'}})
    method is where the code that fully renders the visualization must go,
    and, for now, it simply uses D3 to output `"Hello World!"` in the view's DOM element, `domContainer`.
  - The 
    [Pentaho module's configuration]({{site.refDocsUrlPattern | replace: '$', 'pentaho.module.IMeta' | append: '#config'}}) 
    is applied to the type.

## Installing D3

Execute the following:

```shell
# Add and install the D3 dependency
# (also set it as a bundled dependency)
npm install d3 --save --save-bundle
```

## Adapting the HTML sandbox

Edit the `sandbox.html` file and place the following code in it:

```html
<!doctype html>
<html>

<head>
  <style>
    .pentaho-visual-base-model {
      border: solid 1px #005da6;
    }
  </style>

  <!-- load the VizAPI dev context -->
  <script type="text/javascript" src="node_modules/@pentaho/viz-api/webcontext.js"></script>

  <script type="text/javascript">

    /* globals require */

    require.config({
      paths: {
        "d3": "./node_modules/d3/build/d3"
      }
    });

    require([
      "pentaho-visual-samples-bar-d3/Model",
      "pentaho/visual/base/View",
      "pentaho/data/Table",
      "json!./sandbox-data.json"
    ], function(BarModel, BaseView, Table, dataSpec) {

      // Create the visualization model.
      var modelSpec = {
        "data": new Table(dataSpec),
        "category": {fields: ["productFamily"]},
        "measure": {fields: ["sales"]}
      };

      var model = new BarModel(modelSpec);

      // Create the visualization view.
      var viewSpec = {
        width: 1400,
        height: 300,
        domContainer: document.getElementById("viz_div"),
        model: model
      };

      // These are responsibilities of the visualization container application:
      // 1. Mark the container with the model's CSS classes, for styling purposes.
      viewSpec.domContainer.className = model.$type.inheritedStyleClasses.join(" ");

      // 2. Set the DOM container dimensions.
      viewSpec.domContainer.style.width = viewSpec.width + "px";
      viewSpec.domContainer.style.height = viewSpec.height + "px";

      // Create the visualization view.
      BaseView.createAsync(viewSpec)
        .then(function(view) {
          // Handle the execute action.
          view.on("pentaho/visual/action/Execute", {
            "do": function(event, action) {
              alert("Executed " + action.dataFilter.$contentKey);
            }
          });

          // Handle the select action.
          view.on("pentaho/visual/action/Select", {
            "finally": function(event, action) {
              document.getElementById("messages_div").innerText =
                "Selected: " + view.model.selectionFilter.$contentKey;
            }
          });

          // Render the visualization.
          return view.update();
        }, onError);
    }, onError);

    function onError(error) {
      alert(error.message);
    }
  </script>
</head>
<body>
  <!-- div that will contain the visualization -->
  <div id="viz_div"></div>

  <!-- div that will display messages -->
  <div id="messages_div"></div>
</body>
</html>
```

Remarks:
  - The AMD/RequireJS configuration of the D3 path has been added.
    This step is only needed in a sandbox environment.
    When inside the Pentaho platform, these configurations are provided automatically,
    built from the web package information.
  - The used visualization model is now `pentaho-visual-samples-bar-d3/Model`
    (or other, if you choose a different package name on step 1).
  - The model now contains visual role mappings for the `category` and `measure` visual roles.
  - The dimensions of the visualization were modified.

Now, refresh the `sandbox.html` page in the browser, and you should read `Hello World!`.

## Implementing the render code

Let's now finally implement the rendering of a Bar chart in D3.
To make it easy, we'll adapt the code of following D3 block: 
[https://bl.ocks.org/mbostock/3885304](https://bl.ocks.org/mbostock/3885304).

We'll now go through the view's
[_updateAll]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.base.View' | append: '#_updateAll'}})
code, piece by piece.

### Method `_updateAll`, part 1

In `ViewD3.js`, replace the code of the `_updateAll` method with the following:

```js
// ViewD3.js
// _updateAll:
function() {
  // Part 1
  
  var model = this.model;
  var dataTable = model.data;
    
  var scenes = Scene.buildScenesFlat(this).children;
    
  var container = d3.select(this.domContainer);
    
  // ...
}
```

Remarks:
  - [this.model]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.base.View' | append: '#model'}}) 
    gives you access to the visualization model object.
  - The data in the data table needs to be converted into an "array of plain objects" form, 
    so that then it can be directly consumed by D3; 
    to that end, 
    the [pentaho.visual.scene.Base]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.scene.Base'}}) helper
    class is used.
  - [this.domContainer]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.base.View' | append: '#domContainer'}})
    gives you access to the DIV where rendering should take place.

### Method `_updateAll`, part 2

Now, add the following adapted D3 code:

```js
// ViewD3.js
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

  x.domain(scenes.map(function(scene) { return scene.vars.category.toString(); }));
  y.domain([0, d3.max(scenes, function(scene) { return scene.vars.measure.value; })]);

  var svg = container.append("svg")
      .attr("width",  this.width)
      .attr("height", this.height);

  // Title
  var title = this.__getRoleLabel(model.measure) + 
              " per " + 
              this.__getRoleLabel(model.category);

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

  var selectColor = function(scene) {
    return model.palette.colors.at(scene.index % model.palette.colors.count).value;
  };

  var bar = g.selectAll(".bar")
      .data(scenes)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("fill", selectColor)
      .attr("stroke", selectColor)
      .attr("x", function(scene) { return x(scene.vars.category.toString()) + barOffset; })
      .attr("y", function(scene) { return y(scene.vars.measure.value); })
      .attr("width", barWidth)
      .attr("height", function(scene) { return height - y(scene.vars.measure.value); });
}
```

Remarks:
  - The view dimensions are available through 
    [this.width]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.base.View' | append: '#width'}}) and 
    [this.height]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.base.View' | append: '#height'}}).
  - The dynamic chart title is built with the help of the `__getRoleLabel` method, which will be introduced below.
  - The chart title is built with the labels of the mapped fields (see `getRoleLabel` below).
  - The Bar model's `barSize` property is being used to limit the width of bars.
  - The scene objects, previously built by the
    [pentaho.visual.scene.Base]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.scene.Base'}}) helper class, 
    contain variables, one for each visual role; each variable has a value and a formatted value, 
    which is obtained by calling the variable's `toString` method.
  - Scene objects have an `index` property which is being used to cycle through and select the bar color 
    from the `palette` property.

Now, you'll make a small detour to create that new `__getRoleLabel` method.

### Method `__getRoleLabel`

Add a property `__getRoleLabel`, after `_updateAll`, and give it the following code:

```js
// ViewD3.js
// __getRoleLabel: 
function(mapping) {
  
  if(!mapping.hasFields) {
    return "";
  }

  var data = this.model.data;

  var columnLabels = mapping.fieldIndexes.map(function(fieldIndex) {
    return data.getColumnLabel(fieldIndex);
  });

  return columnLabels.join(", ");
}
```

Remarks:
  - The visual role mapping object's 
    [fieldIndexes]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.role.Mapping' | append: '#fieldIndexes'}}),
    property conveniently gives you the indexes of the 
    [fields]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.role.Mapping' | append: '#fields'}}) 
    mapped to a visual role.
  - The label of a field is obtained from the data table's
    [getColumnLabel]({{site.refDocsUrlPattern | replace: '$', 'pentaho.data.ITable' | append: '#getColumnLabel'}})
    method.

Now, refresh the `sandbox.html` page in the browser, and you should finally see a Bar chart!

**Continue** to [Styling the view](step4-view-styling).
