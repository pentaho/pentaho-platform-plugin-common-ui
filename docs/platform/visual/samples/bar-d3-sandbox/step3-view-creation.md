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

Create a file named `View.js` and place the following code in it:

```js
define([
  "pentaho/module!_",
  "pentaho/visual/impl/View",
  "d3"
], function(module, BaseView, d3) {
  
  "use strict";

  // Create and return the Bar View class
  return BaseView.extend(module.id, {
    
    _updateAll: function() {
      d3.select(this.domContainer).text("Hello World!");
    }
  });
});
```

Remarks:
  - Depending on how AMD/RequireJS is configured, 
    the view module will be identified by, 
    for example: `pentaho/visual/samples/barD3/View`).
  - Inherits directly from the _optional_ base view class, 
    [pentaho/visual/impl/View]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.impl.View'}}).
  - The [_updateAll]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.impl.View' | append: '#_updateAll'}})
    method is where the code that fully renders the visualization must go,
    and, for now, it simply uses D3 to output `"Hello World!"` in the view's DOM element, 
    [domContainer]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.impl.View' | append: '#domContainer'}}).

## Installing D3

Execute the following:

```shell
# Add and install the D3 dependency
# (also set it as a bundled dependency)
npm install d3 --save --save-bundle
```

## Configuring the view as the default view

The new view type must be associated with the model type developed in the previous section.
Edit the `package.json` and add a 
[DefaultView]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.DefaultViewAnnotation'}}) 
annotation to the model type, 
like in (the `"..."` properties stand for omitted content):

```json
{
  "name": "@pentaho/visual-samples-bar-d3",
  
  "...": "...",
  
  "config": {
    "pentaho/modules": {
      "pentaho/visual/samples/barD3/Model": {
        "base": "pentaho/visual/Model",
        "annotations": {
          "pentaho/visual/DefaultView": {
            "module": "./View"
          }
        }
      }
    }
  },
  
  "...": "..."
}
``` 

## Adapting the HTML sandbox

Edit the `sandbox.html` file, 
by replacing the sandbox construction _statement_ with the following one:

```js
var sandbox = new Sandbox({
  id: "pentaho/visual/samples/barD3/Model",
  spec: {
    "data": new Table(datasets.productSales),
    "category": {fields: ["productFamily"]},
    "measure": {fields: ["sales"]}
  },
  container: "viz_div",
  messages: "msg_div"
});
```

Remarks:
  - The used visualization model is now `pentaho/visual/samples/barD3/Model`.
  - The model now contains visual role mappings for the `category` and `measure` visual roles.

At last, refresh the `sandbox.html` page in the browser!
You should read `Hello World!`.

## Implementing the render code

Let's now implement the rendering of a Bar chart in D3.
To make it easy, we'll adapt the code of following D3 block: 
[https://bl.ocks.org/mbostock/3885304](https://bl.ocks.org/mbostock/3885304).

We'll go through the view's
[_updateAll]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.impl.View' | append: '#_updateAll'}})
code, piece by piece.

### Method `_updateAll`, part 1

In `View.js`, add the `"pentaho/visual/scene/Base"` dependency to the module:

```js
define([
  "pentaho/module!_",
  "pentaho/visual/impl/View",
  "d3",
  "pentaho/visual/scene/Base"
], function(module, BaseView, d3, Scene) {
  
  // ...
  
}
```

Then, _replace_ the code of the `_updateAll` method with the following:

```js
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
  - [this.model]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.impl.View' | append: '#model'}}) 
    gives you access to the visualization model object.
  - The data in the data table needs to be converted into an "array of plain objects" form, 
    so that, then, it can be directly consumed by D3; 
    to that end, 
    the [pentaho.visual.scene.Base]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.scene.Base'}}) helper
    class is used.
  - [this.domContainer]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.impl.View' | append: '#domContainer'}})
    gives you access to the DOM element where rendering takes place.

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
  
  var margin = {top: 50, right: 30, bottom: 30, left: 75};

  var width = model.width - margin.left - margin.right;
  var height = model.height - margin.top - margin.bottom;

  var x = d3.scaleBand().rangeRound([0, width]).padding(0.1);
  var y = d3.scaleLinear().rangeRound([height, 0]);
  
  x.domain(scenes.map(function(scene) { return scene.vars.category.toString(); }));
  y.domain([0, d3.max(scenes, function(scene) { return scene.vars.measure.value; })]);

  var svg = container.append("svg")
    .attr("width", model.width)
    .attr("height", model.height);

  // Title
  var title = this.__getRoleLabel(model.measure) + " per " + this.__getRoleLabel(model.category);

  svg.append("text")
    .attr("class", "title")
    .attr("y", margin.top / 2)
    .attr("x", model.width / 2)
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
  var barWidth = Math.min(model.barSize, bandWidth);
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
  - The model dimensions are available through 
    [model.width]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.Model' | append: '#width'}}) and 
    [model.height]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.Model' | append: '#height'}}).
  - The dynamic chart title is built with the help of the `__getRoleLabel` method, which will be introduced below.
  - The model's `barSize` property is being used to limit the width of bars.
  - The scene objects, previously built by the
    [pentaho.visual.scene.Base]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.scene.Base'}}) helper class, 
    contain variables, one for each visual role; each variable has a value and a formatted value, 
    which is obtained by calling the variable's `toString` method.
  - Scene objects have an `index` property which is being used to cycle through and select each bar's color 
    from the `palette` property.

Now, you'll make a small detour to create the new `__getRoleLabel` method.

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
