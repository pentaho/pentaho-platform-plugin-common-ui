---
title: Configuring your Visualization
description: Shows how to use the Configuration API to configure a visualization.
parent-title: Visualization API
layout: default
---

This article shows you how to create a configuration for a 
[Visualization API](.) 
visualization.

It is assumed that you have some basic knowledge on how to configure JavaScript _types_ on the Pentaho platform
and on what constitutes a visualization.
If not, you should first read [Configuration API](../configuration) and 
[Creating a visualization](./#creating-a-visualization).

Visualizations are constituted by one 
[`Model`]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.base.Model'}}) 
type and (at least) one 
[`View`]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.base.View'}})
type,
any of which is a 
[Type API]({{site.refDocsUrlPattern | replace: '$', 'pentaho.type'}}) complex type 
that can be configured.

Section [Identifiers of Stock Visualizations](#identifiers-of-stock-visualizations) contains the list
of identifiers of stock `Model` and `View` types.

The following sections show examples of typical `Model` and `View` configurations.
A single [IRule]({{site.refDocsUrlPattern | replace: '$', 'pentaho.config.spec.IRule'}}) object 
is provided in each example, 
but it should be interpreted as being part of the following generic configuration module:

```js
define(function() {
  
  "use strict";
  
  var ruleSpec = { /* ... */ };
  
  return {rules: [ruleSpec]};
});
```  

## Examples of typical Model configurations

### Hiding a visualization from an application's visualization list

The following rule configures the 
[isBrowsable]({{site.refDocsUrlPattern | replace: '$', 'pentaho.type.Type' | append: '#isBrowsable'}}) 
type attribute to hide the stock _Pie_ visualization (and any visualizations that derive from it) 
from the [Analyzer](http://www.pentaho.com/product/business-visualization-analytics) application's
visualizations menu, effectively preventing the user from creating new visualizations of this type:

```js
var ruleSpec = {
  select: {
    type: "pentaho/visual/models/pie",
    application: "pentaho-analyzer"
  },
  apply: {
    isBrowsable: false
  }
};
```

### Setting the default line width of a line chart

The following rule configures the default value of the `lineWidth` property of both
the _Line_ and the _Column/Line Combo_ stock visualizations, 
when in the [PDI](http://www.pentaho.com/product/data-integration) application,
to be of `2` pixels:

```js
var ruleSpec = {
  select: {
    type: [
      "pentaho/visual/models/line",
      "pentaho/visual/models/barLine"
    ],
    application: "pentaho-det"
  },
  apply: {
    props: {
      lineWidth: {
        value: 2
      }
    }
  }
};
```

### Setting the default shape of points of a line chart

The following rule configures the default value of the `shape` property of both
the _Line_ and the _Column/Line Combo_ stock visualizations, 
when in any application,
to be the `diamond` shape:

```js
var ruleSpec = {
  select: {
    type: [
      "pentaho/visual/models/line",
      "pentaho/visual/models/barLine"
    ]
  },
  apply: {
    props: {
      shape: {
        value: "diamond"
      }
    }
  }
};
```

### Hiding the line width property of line charts

The following rule hides the `lineWidth` property of both
the _Line_ and the _Column/Line Combo_ stock visualizations, 
from the Analyzer application's properties panel, 
effectively preventing the user from changing its default value:

```js
var ruleSpec = {
  select: {
    type: [
      "pentaho/visual/models/line",
      "pentaho/visual/models/barLine"
    ],
    application: "pentaho-analyzer"
  },
  apply: {
    props: {
      lineWidth: {
        isBrowsable: false
      }
    }
  }
};
```

### Changing the name of a visualization, as shown in the menu of an application

The following rule changes the 
[label]({{site.refDocsUrlPattern | replace: '$', 'pentaho.type.Type' | append: '#label'}})
type attribute of the _Bar_ stock visualization, 
affecting how it is displayed in the visualizations menu of the Analyzer and PDI applications:

```js
var ruleSpec = {
  select: {
    type:"pentaho/visual/models/bar",
    application: [
      "pentaho-analyzer",
      "pentaho-det"
    ]
  },
  apply: {
    label: "Vertical Bars"
  }
};
```

Note that it is a best practice to load localizable text from a resource bundle. 
See [pentaho/i18n]({{site.refDocsUrlPattern | replace: '$', 'pentaho.i18n'}}).

## Examples of typical View configurations

Note that view configuration is typically tied to the technology with which views are built.
The 
[View.Type#extension]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.base.View.Type' | append: '#extension'}})
type attribute exists to satisfy the pass-through of such options of the underlying technology.
You should consult the view type documentation to find out about which extension properties it supports.

The views of stock visualizations are implemented using the 
[CCC](http://community.pentaho.com/ctools/ccc/) charting library,
and can be customized using its rich set of extension points.

### Thicken the axes rules of stock visualizations

The following rule changes the 
[lineWidth](http://community.pentaho.com/ctools/ccc/charts/jsdoc/symbols/pvc.options.marks.RuleExtensionPoint.html#lineWidth)
property of the 
[baseAxisRule_](http://community.pentaho.com/ctools/ccc/charts/jsdoc/symbols/pvc.options.ext.FlattenedDiscreteCartesianAxisExtensionPoints.html#rule)
and
`orthoAxisRule_` 
extension points,
of any applicable stock visualizations,
in any application:

```js
var ruleSpec = {
  select: {
    type:"pentaho/ccc/visual/abstract"
  },
  apply: {
    extension: {
      baseAxisRule_lineWidth: 2,
      orthoAxisRule_lineWidth: 2
    }
  }
};
```

### Change the default label font of axes' ticks of stock visualizations

The following rule changes the 
[font](http://community.pentaho.com/ctools/ccc/charts/jsdoc/symbols/pvc.options.marks.LabelExtensionPoint.html#font)
property of the 
[baseAxisLabel_](http://community.pentaho.com/ctools/ccc/charts/jsdoc/symbols/pvc.options.ext.FlattenedDiscreteCartesianAxisExtensionPoints.html#label)
and
`orthoAxisLabel_` 
extension points,
of any applicable stock visualizations,
when in the PDI application:

```js
var ruleSpec = {
  select: {
    type:"pentaho/ccc/visual/areaStacked",
    application: "pentaho-det"
  },
  apply: {
    extension: {
      baseAxisLabel_font: "12px OpenSansRegular",
      orthoAxisLabel_font: "12px OpenSansRegular"
    }
  }
};
```

## Identifiers of Stock Visualizations

The models of stock visualizations are all sub-modules of `pentaho/visual/models`. 
For example, `pentaho/visual/models/line`, is the identifier of the stock Line visualization model.

The corresponding CCC-based view of a stock visualization is a sub-module of `pentaho/ccc/visual`. 
For example, `pentaho/ccc/visual/line`, is the identifier of the CCC view corresponding to 
the stock Line visualization model.

| Local Module            | Description              |
|-------------------------|--------------------------|
| abstract                | All stock visualizations |
| areaStacked             | Area Stacked             |
| line                    | Line                     |
| bar                     | Column                   |
| barStacked              | Column Stacked           |
| bar                     | Column Stacked 100%      |
| barHorizontal           | Bar                      |
| barStackedHorizontal    | Bar Stacked              |
| barNormalizedHorizontal | Bar Stacked 100%         |
| barLine                 | Column/Line Combo        |
| scatter                 | X/Y Scatter              |
| bubble                  | Bubble                   |
| heatGrid                | Heat-Grid                |
| pie                     | Pie                      |
| donut                   | Donut                    |
| sunburst                | Sunburst                 |
