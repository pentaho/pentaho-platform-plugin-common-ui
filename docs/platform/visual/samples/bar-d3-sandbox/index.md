---
title: Create a custom Bar chart visualization using D3
description: Walks you through the creation of a simple Bar chart visualization that uses the D3 graphics library.
parent-title: Visualization API
parent-path: ../..
layout: default
---

The following steps will walk you through the creation of a simple Bar chart visualization, 
using the Pentaho Visualization API and the amazing [D3](https://d3js.org/) graphics library.
 
The complete code of this sample is available at 
[pentaho/pentaho-engineering-samples](https://github.com/pentaho/pentaho-engineering-samples/Samples for Extending Pentaho/javascript-apis/platform/pentaho/visual/samples/bar-d3-sandbox).

## Prerequisites

- Basic JavaScript knowledge
- Basic D3 knowledge
- An npm registry compatible package manager like [npm](https://www.npmjs.com) or [yarn](https://yarnpkg.com).

## Preparing the environment

While reading, you can either build the sample step-by-step or follow along with the complete code.

### a. Following with the complete code

```shell
  # clone the repository
  git clone https://github.com/pentaho/pentaho-engineering-samples

  # go to the sample's directory
  cd "Samples for Extending Pentaho/javascript-apis/platform/pentaho/visual/samples/bar-d3-sandbox"

  # install the dependencies
  npm install
  # or: yarn install
```

### b. Building it yourself

1. Create a folder and then initialize it:
  ```shell
    # create the package.json file
    npm init
    
    # add and install the Visualization API dev dependency
    # (the runtime dependecy is provided by the platform)
    npm install https://github.com/nantunes/pentaho-viz-sandbox/releases/download/3.0.4/nantunes-viz-api-3.0.4.tgz --save-dev
    # or: yarn add https://github.com/nantunes/pentaho-viz-sandbox/releases/download/3.0.4/nantunes-viz-api-3.0.4.tgz --dev
  ```

2. Create a file named `sales-by-product-family.json` and place the following content in it:
```json
{
  "model": [
       {"name": "productFamily", "type": "string", "label": "Product Family"},
       {"name": "sales",         "type": "number", "label": "Sales"}
  ],
  "rows": [
       {"c": [{"v": "cars-classic", "f": "Classic Cars"}, 2746782]},
       {"c": [{"v": "motorcycles", "f": "Motorcycles"}, 753753]},
       {"c": [{"v": "planes", "f": "Planes"}, 748324]},
       {"c": [{"v": "ships", "f": "Ships"}, 538982]},
       {"c": [{"v": "trains", "f": "Trains"}, 165215]},
       {"c": [{"v": "trucks-and-buses", "f": "Trucks and Buses"}, 756438]},
       {"c": [{"v": "cars-vintage", "f": "Vintage Cars"}, 1308470]}
  ]
}
```

3. Create a file named `index.html` and place the following content in it:
  ```html
    <!doctype html>
    <html>
      <head>
        <style>
          .pentaho-visual-base {
            border: solid 1px #005da6;
          }
        </style>
       
        <!-- load RequireJS -->
        <script type="text/javascript" src="node_modules/RequireJS/require.js"></script>
    
        <!-- load the VizAPI dev bootstrap helper -->
        <script type="text/javascript" src="node_modules/@nantunes/viz-api/dev-bootstrap.js"></script>
    
        <script>
          require([
            "pentaho/type/Context",
            "pentaho/data/Table",
            "pentaho/visual/base/view",
            "pentaho/visual/samples/calc",
            "json!./sales-by-product-family.json"
          ], function(Context, Table, baseViewFactory, calcFactory, dataSpec) {
            
            // Setup up a VizAPI context.
            var context = new Context({application: "viz-api-sandbox"});
        
            // Create the visualization model.
            var modelSpec = {
              "data": new Table(dataSpec),
              "levels": {attributes: ["productFamily"]},
              "measure": {attributes: ["sales"]},
              "operation": "avg"
            };
        
            var CalcModel = context.get(calcFactory);
            var model = new CalcModel(modelSpec);
        
            // Create the visualization view.
            var viewSpec = {
              width: 400,
              height: 200,
              domContainer: document.getElementById("viz_div"),
              model: model
            };
            
            // These are responsibilities of the visualization container application:
            // 1. Mark the container with the model's CSS classes, for styling purposes.
            viewSpec.domContainer.className = model.type.inheritedStyleClasses.join(" ");
        
            // 2. Set the DOM container dimensions.
            viewSpec.domContainer.style.width = viewSpec.width + "px";
            viewSpec.domContainer.style.height = viewSpec.height + "px";
        
            var BaseView = context.get(baseViewFactory);
            BaseView.createAsync(viewSpec).then(function(view) {
              // Render the visualization.
              view.update();
            });
          });
        </script>
      </head>
    
      <body>
        <!-- div that will contain the visualization -->
        <div id="viz_div"></div>
      </body>
    </html>
  ```

## Visualize it

Open `index.html` in a browser.
You should see the result of the average operation: `The result is 1002566.2857142857`.

The page shows the simplest (and kind of useless) visualization: a
calculator, which just displays the result of aggregating the values of
one column of a dataset.

That's why you have to create your own!

{% include callout.html content="<p>Directly opening the file through the filesystem will not work when using Google Chrome (and possibly other browsers),because of security restrictions that disallow the loading of local resources using XHR — a functionality that is required by the VizAPI to load localization bundles and other resources.</p>
<p>To overcome this limitation you need to serve the project files through an HTTP server. 
There are several simple-to-use solutions:</p>

<b>Node:</b><pre class='highlight'><code>npm install -g node-static
static -p 8000</code></pre>

<b>PHP:</b><pre class='highlight'><code>php -S localhost:8000</code></pre>

<b>Python 2:</b><pre class='highlight'><code>python -m SimpleHTTPServer 8000</code></pre>

<b>Python 3:</b><pre class='highlight'><code>python -m http.server 8000</code></pre>

<b>Ruby:</b><pre class='highlight'><code>ruby -run -e httpd . -p 8000</code></pre>
" type="warning" %}

## Quick background facts

### On visualizations...

A visualization is constituted by:

- One **model**, which _identifies_ the visualization and _defines_ it 
  in terms of the visual degrees of freedom it has (e.g. _X position_, _color_ and _size_) and 
  any major options that affect its rendering.

- One **view** (at least), which implements the actual rendering using chosen technologies 
  (e.g. [HTML](https://www.w3.org/TR/html/), [SVG](https://www.w3.org/TR/SVG/), [D3](https://d3js.org/)).

### On Bar charts...

The simplest of Bar charts shows a single _series_ of data: 
a list of pairs of a category and a measure, where each category can only occur in one of the pairs.

Each pair (i.e. each category) is represented by a _bar_ visual element, 
and is assigned a stripe of the horizontal space and all of the vertical space, 
in which the height of the bar encodes the measure value.

Thus, the simplest Bar chart has two main data-bound visual degrees of freedom, or, 
as they are called in the Visualization API, **visual roles**: 
_Category_ and _Measure_.
The values of the attributes mapped to visual roles are visually encoded using visual variables/properties such as 
position, size, orientation or color.

## Creating the Bar model

### Complete model code

Create a file named `model.js` and place the following code in it:

```js
define([
  "module",
  "pentaho/visual/base"
], function(module, baseModelFactory) {
  
  "use strict";
  
  return function(context) {
    
    var BaseModel = context.get(baseModelFactory);
    
    var BarModel = BaseModel.extend({
      type: {
        id: "pentaho/visual/samples/bar",
        sourceId: module.id,
        label: "D3 Bar Chart",
        defaultView: "./view-d3",
        props: [
          {
            name: "barSize",
            type: "number",
            value: 30,
            isRequired: true
          },
          {
            name: "category",
            type: {
              base: "pentaho/visual/role/ordinal",
              props: {attributes: {isRequired: true, countMax: 1}}
            }
          },
          {
            name: "measure",
            type: {
              base: "pentaho/visual/role/quantitative",
              dataType: "number",
              props: {attributes: {isRequired: true, countMax: 1}}
            }
          }
        ]
      }
    });
    
    return BarModel;
  };
});
```

Remarks:
  - The value of the AMD module is a factory function of Bar model classes.
  - Defines a visualization (model) of id `pentaho/visual/samples/bar`.
  - Inherits directly from the base visualization model, 
    [pentaho/visual/base]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.base.Model'}}).
  - Specifies the
    [default view]({{site.refDocsUrlPattern | replace: '$', 'pentaho.type.Type' | append: '#defaultView'}}) 
    to use with this model (which you'll create in a moment).
  - Two main types of property exist: general and visual roles.
  
The following sections explain each of the model properties.
  
### The `barSize` property

```js
specification = {
  name: "barSize",
  type: "number",
  value: 30,
  isRequired: true
}
```

A general property which determines the constant width of bars. 
It is of 
[type]({{site.refDocsUrlPattern | replace: '$', 'pentaho.type.Property.Type' | append: '#type'}})
[number]({{site.refDocsUrlPattern | replace: '$', 'pentaho.type.Number'}}), 
is [required]({{site.refDocsUrlPattern | replace: '$', 'pentaho.type.Property.Type' | append: '#isRequired'}}) and 
has a 
[default value]({{site.refDocsUrlPattern | replace: '$', 'pentaho.type.Property.Type' | append: '#value'}}) 
of `30`.
That's as simple as it gets.

### The `category` property

```js
specification = {
  name: "category",
  type: {
    base: "pentaho/visual/role/ordinal",
    props: {attributes: {isRequired: true, countMax: 1}}
  }
}
```

Represents the _Category_ visual role.
Being [ordinal]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.role.OrdinalMapping'}}) 
means that it can visually encode discrete values 
and their relative order.

The [data]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.base.Mode' | append: '#data'}}) property, 
which is inherited from the base visualization model, 
is given a dataset containing data for attributes such as _Product Family_ and _Sales_.
The value of a visual role contains the names of the data attributes that are _mapped_ to it,
e.g.: `{attributes: ["productFamily"]}`. 
So, the value of a visual role is an object with a list property named 
[attributes]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.role.Mapping' | append: '#attributes'}}).

Because by default, any number of data attributes can be mapped to a visual role, including 0 or 10, 
it is necessary to derive the 
[pentaho/visual/role/ordinal]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.role.OrdinalMapping'}}) 
visual role type to limit the cardinality 
limits of its `attributes` property, so that it accepts and requires a single data attribute.

### The `measure` property

```js
specification = {
  name: "measure",
  type: {
    base: "pentaho/visual/role/quantitative",
    dataType: "number",
    props: {attributes: {isRequired: true, countMax: 1}}
  }
}
```

Represents the _Measure_ visual role. 
Being [quantitative]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.role.QuantitativeMapping'}}) 
means that it can visually represent the proportion between values (_this is twice that_).
The quantitative data types are 
[date]({{site.refDocsUrlPattern | replace: '$', 'pentaho.type.Date'}})
and 
[number]({{site.refDocsUrlPattern | replace: '$', 'pentaho.type.Number'}}).
The [dataType]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.role.Mapping.Type' | append: '#dataType'}})
is used to only allow mapping to data attributes of type `number`.

### Additional model metadata

The model could still be enriched in several ways, such as:

- Providing localized labels/descriptions for the name of the visualization and that of its properties.
- Providing standard icons for supported Pentaho themes.

However, these are all accessory and can be done at a later stage.
Now you can't wait to see something shining on the screen, so let's move on into creating the view.

## Creating the Bar View

### Skeleton view code

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
  - Defines a visualization view type of id `pentaho/visual/samples/bar/view`.
  - Inherits directly from the base visualization view, 
    [pentaho/visual/base/view]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.base.View'}}).
  - The inherited 
    [model]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.base.View' | append: '#model'}}) 
    property is overridden so that its 
    [type]({{site.refDocsUrlPattern | replace: '$', 'pentaho.type.Property.Type' | append: '#type'}}) 
    is the Bar model you previously created.
  - The [_updateAll]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.base.View' | append: '#_updateAll'}})
    method is where the code that fully renders the visualization must go,
    and, for now, it simply uses d3 to output `"Hello World!"` in the view's DOM element, `domContainer`.

### Installing D3

Execute the following:

```shell
# add and install the D3 dependency
npm install d3 --save
# or: yarn add d3
```

### Adapting the HTML sandbox

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

### Implementing the render code

Let's now finally implement the rendering of a Bar chart in D3.
To make it easy, we'll adapt the code of following D3 block: 
[https://bl.ocks.org/mbostock/3885304](https://bl.ocks.org/mbostock/3885304).

We'll now go through the view's
[_updateAll]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.base.View' | append: '#_updateAll'}})
code, piece by piece.

#### Method `_updateAll`, part 1

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

#### Method `__buildScenes`

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

#### Method `_updateAll`, part 2

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

### Styling your visualization

Noticed that you added CSS classes to some of the SVG elements? 
Let's then give some love to the Bar chart by styling it with CSS.

#### Creating the CSS file

Create a folder named `css` and, in it, create a file named `view-d3.css`. Add the following content to it:

```css
.pentaho-visual-samples-bar .bar {
  fill: #007297;
}

.pentaho-visual-samples-bar .bar:hover {
  fill: #1973bc;
}

.pentaho-visual-samples-bar .axis path,
.pentaho-visual-samples-bar .tick line {
  stroke: #cbdde8;
}

.pentaho-visual-samples-bar .tick text {
  font-family: OpenSansLight, Helvetica, Arial, Sans serif;
  fill: #26363d;
}

.pentaho-visual-samples-bar .title {
  font-family: OpenSansLight, Helvetica, Arial, Sans serif;
  font-size: 18px;
  font-style: normal;
  fill: #005f7d;
}
```

Remarks:
  - The CSS rules are scoped with the visualization model's
    CSS [style class]({{site.refDocsUrlPattern | replace: '$', 'pentaho.type.Type' | append: '#styleClass'}}), 
    which, by default is derived from its id, `pentaho/visual/samples/bar`.

#### Loading the CSS file with the view

To load the view's CSS file dynamically, whenever the view module is loaded, use the `css` AMD/RequireJS plugin.
Modify the AMD module declaration of the `view-d3.js` file to the following:

```js
define([
  "module",
  "pentaho/visual/base/view",
  "./model",
  "d3",
  "css!./css/view-d3"
], function(module, baseViewFactory, barModelFactory, d3) {
  // ...
});
```

Now, refresh the `index.html` page in the browser, and you should see a more colorful Bar chart!

### Adding interactivity

Visualizations can be much more fun and useful if the user is able to interact with them.
The Visualization API defines two standard types of actions: 
[execute]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.action.Execute'}}) and
[select]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.action.Select'}}).
Most container applications handle these in some useful way.

#### On data actions and filters...

Visualization API 
[data actions]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.action.Data'}}) 
carry information that _identifies_ the visual element with which the user interacted 
in terms of the subset of data that it visually represents.
This is conveyed in their
[dataFilter]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.action.Data' | append: '#dataFilter'}})
property.

In this visualization, 
because 
each bar represents a category of the data, 
and the _Category_ visual role is mapped to a single data attribute, 
then 
each bar corresponds to a distinct value of the mapped data attribute.

#### Implementing the `execute` action

The `execute` action is typically performed in response to a double-click event on the main visual elements,
in this case, the bars.

##### Declare the dependency on the `execute` action

The `execute` action type module needs to be loaded with the view module.
Modify the AMD module declaration of the `view-d3.js` file to the following:

```js
define([
  "module",
  "pentaho/visual/base/view",
  "./model",
  "pentaho/visual/action/execute",
  "d3",
  "css!./css/view-d3",
], function(module, baseViewFactory, barModelFactory, executeActionFactory, d3) {
  // ...
});
```

##### Handle the `dblclick` event

Now, you'll handle the `dblclick` event of the SVG rect elements — the bars.
Add the following code to the `_updateAll` method:

```js
// view-d3.js
// _updateAll:
function() {
  // Part 1 & 2
  // ...
  
  // Part 3
  var view = this;
  var context = this.type.context;

  bar.on("dblclick", function(d) {
    
    var filterSpec = {_: "=", property: categoryAttribute, value: d.category};

    var ExecuteAction = context.get(executeActionFactory);
    var action = new ExecuteAction({dataFilter: filterSpec});

    view.act(action);
  });
}
```

Remarks:
  - An [isEqual]({{site.refDocsUrlPattern | replace: '$', 'pentaho.type.filter.IsEqual'}}) 
    filter is being created; `=` is the alias of the filter type. 
  - The action is being dispatched through the view, where action listeners can handle it. 

##### Handle the `execute` action event

Finally, you'll handle the `execute` action event from the sandbox side, 
so that it is clear that the action is being dispatched.

In `index.html`, find the statement `view.update()`. 
Just before it, add the following:

```js
view.on("pentaho/visual/action/execute", {
  "do": function(action) {
    alert("Executed " + action.dataFilter.contentKey);
  }
});
```

Remarks:
  - Actions emit events whose _type_ is the id of the action's type.
  - Actions emit _structured_ events, composed of multiple phases; you're handling its `do` phase.
  - Action listener functions receive the action as argument.
  - The filter's 
    [contentKey]({{site.refDocsUrlPattern | replace: '$', 'pentaho.type.filter.Abstract' | append: '#contentKey'}})
    property provides an easy way to get a human-readable description of a filter.

What are you waiting for? 
Refresh the `index.html` page in the browser, and double-click a bar!

#### Implementing the `select` action

The `select` action is an _auxiliary_ action.
Its goal is to mark a subset of data on which, later, a _real_ action, such as drilling-down, is performed.
The current set of selected data is stored in the view's 
[selectionFilter]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.base.View' | append: '#selectionFilter'}})
property.
For each `select` action that is performed, 
its [dataFilter]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.action.Data' | append: '#dataFilter'}}), 
may be removed from, be added to, replace or toggled in the view's current `selectionFilter`, 
according to the action's 
[selectionMode]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.action.Select' | append: '#selectionMode'}}).

Visualizations typically highlight visual elements that represent data that is selected.
Container applications typically expose actions, from which the user can choose,
to be performed on the currently selected subset of data.

You'll let the user _select_ bars by clicking on them.

##### Declare the dependency on the `select` action

The `select` action type module needs to be loaded with the view module.
Modify the AMD module declaration of the `view-d3.js` file to the following:

```js
define([
  "module",
  "pentaho/visual/base/view",
  "./model",
  "pentaho/visual/action/execute",
  "pentaho/visual/action/select",
  "d3",
  "css!./css/view-d3",
], function(module, baseViewFactory, barModelFactory, executeActionFactory, selectActionFactory, d3) {
  // ...
});
```

##### Handle the `click` event

Now, you'll handle the `click` event of the SVG rect elements, the bars.
Add the following code to the `_updateAll` method:

```js
// view-d3.js
// _updateAll:
function() {
  // Part 1 & 2 & 3
  // ...
  
  // Part 4
  bar.on("click", function(d) {
    
    var filterSpec = {_: "=", property: categoryAttribute, value: d.category};

    var SelectAction = context.get(selectActionFactory);
    var action = new SelectAction({dataFilter: filterSpec, selectionMode: "replace"});

    view.act(action);
  });
}
```

Remarks:
  - Each time a bar is clicked, the current view's `selectionFilter` will be 
    [replaced]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.action' | append: '#SelectionModes'}})
    with the data filter associated with the clicked bar.

##### Handle the `select` action event

You'll handle the `select` action event from the sandbox side, 
so that it is clear that the action is being dispatched.

In `index.html`, find the markup `<div id="viz_div"></div>`. 
Immediately after it, add the following:

```html
   <div id="messages_div"></div>
```

Again, in `index.html`, find the statement `view.update()`. 
Just before it, add the following:

```js
view.on("pentaho/visual/action/select", {
  "finally": function(action) {
    document.getElementById("messages_div").innerText = "Selected: " + action.dataFilter.contentKey;
  }
});
```

Remarks:
  - You're handling the `finally` phase of the `select` action, the last phase, that is called whatever happens.
  - The `select` action's 
    [default action]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.action.Select' | append: '#_doDefault'}})
    automatically processes the action's `dataFilter` and `selectionMode` and applies it to the view's
    `selectionFilter`. Alternatively, you could show the content's of the view's `selectionFilter` property.

Refresh the `index.html` page in the browser, and click a bar!
You should see a text under the visualization showing the selected data's filter.

##### Render selected bars differently

It would be much nicer if bars where highlighted with a different color when selected. Let's do that.

###### Edit the CSS file

Edit the `view-d3.css` file. Append the following rules to it:

```css
.pentaho-visual-samples-bar .bar.selected {
  fill: #97372d;
}

.pentaho-visual-samples-bar .bar.selected:hover {
  fill: #970a05;
}
```

###### Change the render code

Finally, add the following code to the `_updateAll` method:

```js
// view-d3.js
// _updateAll:
function() {
  // Part 1 & 2 & 3 & 4
  // ...
  
  // Part 5
  bar.classed("selected", function(d) {
    var selectionFilter = view.selectionFilter;
    return !!selectionFilter && dataTable.filterRow(selectionFilter, d.rowIndex);
  });
}
```

Refresh the `index.html` page in the browser, and click a bar!
You should see the selected bar exhibiting different colors.

#### Conflicting Click and Double-click events

You might have noticed that, when double-clicking, apart from the `dblclick` event, 
two other `click` events are being triggered. 
This is a known issue of DOM events and there are multiple solutions to it.
Here's one solution, specifically for D3: 
[Distinguishing click and double-click in D3](http://bl.ocks.org/couchand/6394506).

## Next steps

You've covered the basics of developing a visualization for the Pentaho Visualization API.
Many features, such as color palettes, localization, theming and configuration, were purposely left out, 
to keep things as accessible as possible.
