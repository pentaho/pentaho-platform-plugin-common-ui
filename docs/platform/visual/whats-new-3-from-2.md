---
title: What's new in the Visualization API
description: Describes the new version of the Visualization API, relative to the previous version.
parent-title: Visualization API
layout: default
---

## Introduction

The new Visualization API represents a big change in relation to its previous version.
Comparing the two, feature-wise, and from a distance, there aren't many new features.
On a closer look though, in the previous version, many things worked only within the Analyzer application,
thus breaking the premise that the API was application-independent.
To take advantage of the enhanced capabilities offered by the Analyzer application, 
the visualizations' implementations were scattered with uses of the Analyzer API,
and would not work on CTools, for example.
To design the new Visualization API, a big effort was made to identify all of the features that needed to work
in an application-independent way, and to come up with a _visualization contract_ that would make it possible.

One of the first realizations was that developing visualizations is, in a big part, 
the same as developing a component of a dashboard application, for example.
Things like advertising an existing visualization to the system, listing all existing visualizations in a system,
obtaining basic UI metadata that enables offering these in the menu of an application,
enabling or disabling certain visualizations, 
obtaining metadata of available properties to dynamically create an UI which allows the end user to specify their values,
and more, are common needs of applications which use components.

With this in mind, the new Visualization API, purposely left everything which was not 
the specific concern of _data visualization_ to other APIs, many of which had to be developed to support that goal.
What was before an API which _tried_ to answer all of these concerns,
was turned into many shareable APIs, each dealing with its own concerns, 
being the new Visualization API at the top of the pyramid. 
While you don't strictly need to be aware of this, when developing a visualization for the new API,
it's good to know that much of what you'll learn might be useful outside of the Visualization API.

Like most of the current Pentaho platform code, the new Visualization API uses AMD/RequireJS as the modules technology.
The previous version of the API was developed using a "global variable" paradigm.

## Conversion of a visualization

Perhaps the best way to show the differences between the previous and new APIs is 
to guide you through the conversion of a simple visualization.
We'll convert the "KPI" visualization, 
which was presented in the 
[Extend Pentaho Analyzer with Custom Visualizations](https://help.pentaho.com/Documentation/8.2/Developer_Center/Customize_Analyzer/Third_Party_Visualizations) tutorial, 
in previous Pentaho server versions.
The new version of this visualization can be found in the Visualization API code base, under the name of 
[Calculator](https://github.com/pentaho/pentaho-platform-plugin-common-ui/tree/8.3/impl/client/src/main/javascript/web/pentaho/visual/samples/calc).
The new version has some changes relative to the original visualization, but it should be easy to make the correspondence. 
To avoid confusion, in the snippets here presented, the previous visualization's naming is always used.

### Converting metadata and registration

**Before - Metadata and Registration**
```js
pentaho.visualizations.push({ 
  id: 'pentaho_sample_KPI',      // Unique identifier
  name: 'Example KPI',           // Visible name, this will come from a properties file, eventually 
  type: 'kpi',                   // Generic type id 
  source: 'Example',             // Id of the source library 
  'class': 'pentaho.sample.KPI', // Type of the Javascript object to instantiate
  menuOrdinal: 10001,
  menuSeparator: true,
  maxValues: [1000, 2000, 3000], 
  args: {                        // Arguments to provide to the Javascript object 
    aggregate: 'AVG'             //  this allows a single class to act as multiple visualizations
  },
  dataReqs: [                    // dataReqs describes the data requirements of this visualization 
    { 
      name: 'Default', 
      reqs : 
        [ 
          { 
            id: 'rows',               // ID of the data element 
            dataType: 'string',       // data type - 'string', 'number', 'date', 
                                      // 'boolean', 'any' or a comma separated list 
            dataStructure: 'column',  // 'column' or 'row' - only 'column' supported so far 
            caption: 'Level',         // visible name 
            required: true,           // true or false 
            allowMultiple: false, 
            ui: { 
              group: 'data' 
            } 
          }, 
          {
            id: 'measures', 
            dataType: 'number', 
            dataStructure: 'column', 
            caption: 'Measure', 
            required: true, 
            allowMultiple: false, 
            ui: { 
              group: "data" 
            } 
          }, 
          { 
            id: 'aggregate', 
            dataType: 'string', 
            values: ['MIN', 'MAX', 'AVG'], 
            ui: { 
              labels: ['Minimum', 'Maximum', 'Average'], 
              group: 'options', 
              type: 'combo',  // combo, checkbox, slider, textbox, gem, gemBar, and button are valid ui types
              caption: 'Aggregation' 
            }
          }
        ]
    }
  ]
});
```

There's a lot to absorb in this. The `pentaho.visualizations` is a global array where visualizations' metadata
is placed. The visualization has an identifier of `pentaho_sample_KPI` and is presented in the UI as `Example KPI`.
The visualization itself is a JavaScript class which should be published globally in the path `pentaho.sample.KPI`.

There's a list of data requirements, of which only the first was ever supported. Here it is named `Default`.
The data requirements contain the definition of the so called "data elements" options, `rows` and `measures`, 
and of general options, `aggregate`. 
Take a moment to absorb the various pieces of information being specified for each.

Then, the visualization needed to be registered with Pentaho Analyzer. 
The following would be placed in an Analyzer plugin file:

**Before - Analyzer registration**
```js
// example_analyzer_plugin.js
var analyzerPlugins = analyzerPlugins || [];

analyzerPlugins.push({
  init: function() { 
	  // Register visualizations to display in Analyzer 
    cv.pentahoVisualizations.push(pentaho.visualizations.getById('pentaho_sample_KPI')); 

    // Helpers contain code that knows about the Analyzer specific context. The one 
    // function that's required "generateOptionsFromAnalyzerState" is called so the 
    // visualization can set its own options based on Analyzer's current report.  
    cv.pentahoVisualizationHelpers['pentaho_sample_KPI'] = { 
      // Use one of Analyzer's stock placeholder images. 
      placeholderImageSrc: CONTEXT_PATH + 'content/analyzer/images/viz/VERTICAL_BAR.png', 

      // This method allows a visualization to generate visualization specific 
      // options based on Analyzer’s report definition. In the following example, 
      // this visualisation is setting a background color using the same background 
      // color setting in Chart Options. You can figure out the existing chart 
      // options by looking at the report XML by clicking the XML link in Analyzer.    
      // return a hash object containing the custom state of your visualization.
      generateOptionsFromAnalyzerState: function(report) { 
        return {myBackgroundColor: report.reportDoc.getChartOption("backgroundColor")}; 
      }
    };

    // LayoutConfig objects manage the interaction between Analyzer's Layout Panel 
    // and the visualization's settings.

    // Declare a new class which extends the built-in version from Analyzer. 
    dojo.declare("SampleConfig", [analyzer.LayoutConfig], { 
      onModelEvent: function(config, item, eventName, args) {
        if(eventName == "value") {
          this.report.visualization.args['aggregate'] = config.byId('aggregate').value; 
  
          // Add a report state item to the undo/redo history stack. 
          this.report.history.add(new cv.ReportState("Update KPI Aggregation"));
  
          // Trigger a report refresh so that the visualization is updated with the change.
          this.report.refreshReport();
        }
        
        this.inherited(arguments);  
      }
    });

    // Register the Layout Panel Configuration Manager. 
    // Note that the string entry matches 'JSON_' plus the visualization id 
    // defined earlier.
    analyzer.LayoutPanel.configurationManagers['JSON_pentaho_sample_KPI'] = SampleConfig; 
  } // init
});
```

As you see, a lot more had to be done to display a visualization in Analyzer.

In the new Visualization API, a visualization is identified by its model class. 
The model class plays the double role of concentrating the metadata of a visualization and
of serving as the runtime object used by applications and visualizations to write and read options from.

**After - Model/Metadata**
```js
// Model.js
define([
  "pentaho/module!_",
  "pentaho/visual/Model",
  "pentaho/i18n!model"
], function(module, BaseModel, bundle) {

  "use strict";
  
  var operDomain = bundle.structured.operation.domain;

  return BaseModel.extend({
    $type: {
      id: module.id,
      props: [
        {
          name: "rows",
          base: "pentaho/visual/role/Property",
          modes: [{dataType: "string"}],
          fields: {isRequired: true}
        },
        {
          name: "measures",
          base: "pentaho/visual/role/Property",
          modes: [{dataType: "number"}],
          fields: {isRequired: true}
        },
        {
          name: "aggregate",
          valueType: "string",
          domain: [
            {v: "min", f: operDomain.min.f},
            {v: "max", f: operDomain.max.f},
            {v: "avg", f: operDomain.avg.f}
          ],
          defaultValue: "avg"
        },
        {
          name: "backgroundColor",
          valueType: "string"
        }
      ]
    }
  })
  .localize({$type: bundle.structured.type})
  .configure();
});
```

This defines a model class, which inherits from the base model class, 
[`pentaho.visual.Model`]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.Model'}}).
The identifier of the visualization is that of its model class' AMD module, 
which could be `pentaho/visual/samples/KPI/Model`.

Two special properties, which the new Visualization API calls visual roles, are declared, `rows` and `measures`.
Previously, these were called "data elements". The first accepts a single data field having a `string` data type and 
the second accepts a single data field having a `number` data type. Both require that a data field be mapped.
The general property `aggregate`, of type `string`, determines the type of KPI which will be calculated.
The general property `backgroundColor` models the undeclared property of the previous version visualization 
which receives the background color from the Analyzer chart options dialog (options shared by every visualization). 

The previous UI supporting metadata was split across an associated i18n file and configuration.
The metadata stating the type of UI control that would be displayed for general options has no correspondence in the
new API.
 
The associated i18n properties file, `model.properties`, contains the following:

```properties
type.label=Example KPI
type.description=A simple KPI example.
type.category=kpi
type.props.rows.label=Level
type.props.measures.label=Measure
type.props.aggregate.label=Aggregation
operation.domain.min.f=Minimum
operation.domain.max.f=Maximum
operation.domain.avg.f=Average
```

Advertising the existence of the visualization to the system is made in 
the associated package's `package.json` file.

**After - Registration**
```json
{
  "name": "@pentaho/visual-samples-kpi",
  "version": "0.0.1",
  "paths": {
    "pentaho/visual/samples/KPI": "/"
  },
  "config": {
    "pentaho/modules": {
      "pentaho/visual/samples/KPI/Model": {
        "base": "pentaho/visual/Model",
        "annotations": {
          "pentaho/visual/DefaultView": {
            "module": "./View"
          }
        }
      },
      "pentaho/visual/samples/KPI/config": {
        "type": "pentaho/config/spec/IRuleSet"
      }
    }
  }
}
```

This definition configures AMD for the code contained within the package, 
to be exposed under the module name `pentaho/visual/samples/KPI`.
Then, the contained `Model` module is declared to export a value which is a subclass of `pentaho/visual/Model` — 
the base class of all visualization models. 
This declaration allows any interested party to discover existing visualizations in the system.

Another important piece of information is the `pentaho/visual/DefaultView` annotation. 
It states the module identifier of the default view class to use to render a `pentaho/visual/samples/KPI/Model` 
visualization model. As you've probably figured out by now, in the new Visualization API, a visualization is composed
of a model and a view, which correspond, grossly, to the previous API's metadata definition and visualization class.

In the new Visualization API, visualizations are not registered with specific applications. 
Still, visualizations can be configured to be presented or not in certain applications and 
there is a way to specify application-specific options.
Most applications will opt to offer all visualizations registered with the system.

Lastly, a contained `config` module is registered as exporting an instance of `pentaho/config/spec/IRuleSet` —
the system type which represents a set of configurations. The next section presents the configuration file.

### Configuration

The option `maxValues` of the metadata of the previous version of the API was actually Analyzer-specific. 
Also, the `generateOptionsFromAnalyzerState` method of the object placed in `cv.pentahoVisualizationHelpers`
allowed binding the option `backgroundColor` from the Analyzer chart options dialog to an option of the visualization.

Other options, such as those controlling menu placement, are also more aptly placed in a configuration file,
and are probably only applied to certain applications.

You can configure your visualization, using the new rule-based configuration system, 
like follows:

```js
// config.js
define({
  rules: [
    {
      select: {
        module: "./Model",
        application: "pentaho/analyzer"
      },
      apply: {
        category: "kpi",
        ordinal: 10001
      }
    },
    {
      select: {
        module: "./Model",
        application: "pentaho/analyzer",
        annotation: "pentaho/analyzer/visual/Options"
      },
      apply: {
        maxValues: [1000, 2000, 3000],
        generateOptionsFromAnalyzerState: function(report) { 
          return {
            backgroundColor: report.reportDoc.getChartOption("backgroundColor")
          };
        }
      }
    }
  ]
});
```

### Converting the visualization class

In the new Visualization API, what was accomplished in the visualization class, 
visually rendering the data and handling user interaction, 
is now accomplished in the visualization view.

**Before - visualization class**
```js
// Define a namespace for this sample to live in.
pentaho.sample = {};

// Define the KPI Class, which renders a single KPI.
pentaho.sample.KPI = function(canvasElement) {
  this.canvasElement = canvasElement;
  this.numSpan = document.createElement("span"); 
  this.numSpan.style.fontSize = "42px"; 
  this.numSpan.style.position = "relative"; 
  this.canvasElement.appendChild(this.numSpan);
};

// Calculate the location of the KPI relative to the canvas.
pentaho.sample.KPI.prototype.resize = function(width, height) { 
  this.numSpan.style.left = ((this.canvasElement.offsetWidth - this.numSpan.offsetWidth) / 2) + 'px'; 
  this.numSpan.style.top = ((this.canvasElement.offsetHeight - this.numSpan.offsetHeight) / 2) + 'px'; 
};

// Render the KPI.
pentaho.sample.KPI.prototype.draw = function(datView, vizOptions) { 
  // Extract the values from the result set.
  var rows = datView.dataTable.jsonTable.rows;
  var dataArray = []; 
  for(var i = 0; i < rows.length; i++){ 
    dataArray.push(rows[i].c[1].v);
  } 

  // Calculate the KPI to display.
  var value = 0; 

  // Note that the vizOptions contains an aggregate option,
  // this is a custom property specific for this visualization type.
  switch(vizOptions.aggregate) { 
    case "MAX": 
      value = Number.MIN_VALUE;
      for(var i = 0; i < dataArray.length; i++) { 
        value = Math.max(value, dataArray[i]); 
      } 
      break;
      
    case "MIN": 
      value = Number.MAX_VALUE;
      for(var i = 0; i < dataArray.length; i++) { 
        value = Math.min(value, dataArray[i]); 
      } 
      break;
      
    case "AVG": 
      var total = 0;
      for(var i = 0; i < dataArray.length; i++) { 
        total += dataArray[i]; 
      } 
      value = total / dataArray.length; 
      break; 
  }
  
  // Update the background color.
  this.canvasElement.style.backgroundColor = vizOptions['myBackgroundColor'];
  
  // Write the KPI value to the screen.
  this.numSpan.innerHTML = value;
  
  this.resize(); 
}
```

**After - visualization view**
```js
// View.js
define([
  "pentaho/visual/impl/View",
  "pentaho/i18n!view"
], function(BaseView, bundle) {

  "use strict";

  return BaseView.extend({

    constructor: function(viewSpec) {

      this.base(viewSpec);

      var numSpan = document.createElement("span");
      numSpan.style.fontSize = "42px";
      numSpan.style.position = "relative";

      this.domContainer.appendChild(numSpan);
    },

    // Called the first time and when more than the size has changed.
    _updateAll: function() {

      var result = this.__calculate();

      this.domContainer.firstChild.innerHTML = bundle.get("result", [result.toFixed(2)]);
      
      // Update the background color.
      this.domContainer.style.backgroundColor = this.model.backgroundColor || "";
      
      this._updateSize();
    },

    // Called when only size has changed.
    _updateSize: function() {

      var element = this.domContainer.firstChild;

      // Center the span
      var width  = this.model.width;
      var height = this.model.height;
      element.style.left = ((width - element.offsetWidth) / 2) + "px";
      element.style.top  = ((height - element.offsetHeight) / 2) + "px";
    },

    // ---------

    __calculate: function() {
      var dataTable = this.model.data;
      var rowCount = dataTable.getNumberOfRows();
      var measureIndex = this.model.measure.fieldIndexes[0];

      var getValue = function(i) {
        var v = dataTable.getValue(i, measureIndex);
        return !isNaN(v) && v != null ? v : null;
      };

      var aggregatedValue = null;
      var rowIndex;
      var value;

      /* eslint default-case: 0 */
      switch(this.model.aggregate) {
        case "max":
          for(rowIndex = 0; rowIndex < rowCount; rowIndex++)
            if((value = getValue(rowIndex)) != null)
              aggregatedValue = aggregatedValue == null ? value : Math.max(aggregatedValue, value);
          break;

        case "min":
          for(rowIndex = 0; rowIndex < rowCount; rowIndex++)
            if((value = getValue(rowIndex)) != null)
              aggregatedValue = aggregatedValue == null ? value : Math.min(aggregatedValue, value);
          break;

        case "avg":
          var total = aggregatedValue = 0;
          if(rowCount) {
            for(rowIndex = 0; rowIndex < rowCount; rowIndex++)
              if((value = getValue(rowIndex)) != null)
                total += value;
            aggregatedValue = total / rowCount;
          }
          break;
      }

      return aggregatedValue;
    }
  });
});
```

This view class is based on the optional base class 
[`pentaho/visual/impl/View`]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.impl.View'}}).
The base class handles smartly calling the most appropriate `_updateXyz` protected method whenever the associated model 
changes, depending on the model properties that have changed.
The view reads data and options from the model object, which is available through the `model` property.
If you prefer, you can also directly implement the 
[`pentaho/visual/IView`]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.IView'}}) interface.

### Packaging

While in the previous version of the Visualization API you would create a Platform Plugin to deploy your visualization,
you now only need to create an NPM-like package and drop it in the special _Karaf deploy_ folder.
You can read more on how to deploy a visualization in [Deploy the visualization](.#deploying-the-visualization).