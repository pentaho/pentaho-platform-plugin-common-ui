---
title: Configuring a Visualization
description: Shows how to use the Modules API to configure a visualization.
parent-title: Visualization API
layout: default
---

This article shows you how to create a configuration for a [Visualization API](.) visualization.

It is assumed that you have some basic knowledge on how to configure JavaScript 
_modules_ on the Pentaho platform and on what constitutes a visualization.
If not, you should first read [Configuration API](../configuration) and 
[Creating a visualization](./#creating-a-visualization).

Visualizations are constituted by a 
[`Model`]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.Model'}}) 
type and a
[`IView`]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.IView'}})
type,
and any of these can be configured.

Section [Identifiers of Stock Visualizations](#identifiers-of-stock-visualizations) contains the list
of identifiers of stock model and view types.
Additionally, 
section [Identifiers of Stock Color Palettes](#identifiers-of-stock-color-palettes) contains the list
of identifiers of stock color palettes.

The following sections show examples of typical model and view type configurations.
A single [IRule]({{site.refDocsUrlPattern | replace: '$', 'pentaho.config.spec.IRule'}}) object 
is provided in each example, 
but it should be interpreted as being part of a generic configuration ruleset module, like the following:

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
from the [Analyzer](https://www.hitachivantara.com/en-us/products/big-data-integration-analytics/pentaho-business-analytics.html) application's
visualizations menu, effectively preventing the user from creating _new_ visualizations of this type:

```js
var ruleSpec = {
  select: {
    module: "pentaho/visual/models/Pie",
    application: "pentaho/analyzer"
  },
  apply: {
    isBrowsable: false
  }
};
```

### Setting the default line width of a line chart and hiding the property

The following rule configures the default value of the `lineWidth` property, 
of both the _Line_ and the _Column/Line Combo_ stock visualizations,
to be `2` pixels and, additionally, 
hides it from the Analyzer application's properties panel,
effectively preventing the user from changing its default value:

```js
var ruleSpec = {
  select: {
    module: [
      "pentaho/visual/models/Line",
      "pentaho/visual/models/BarLine"
    ],
    application: "pentaho/analyzer"
  },
  apply: {
    props: {
      lineWidth: {
        defaultValue: 2,
        isBrowsable: false
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
    module: [
      "pentaho/visual/models/Line",
      "pentaho/visual/models/BarLine"
    ]
  },
  apply: {
    props: {
      shape: {
        defaultValue: "diamond"
      }
    }
  }
};
```

### Changing the name of a visualization, as shown in the menu of an application

The following rule changes the 
[label]({{site.refDocsUrlPattern | replace: '$', 'pentaho.type.Type' | append: '#label'}})
type attribute of the _Bar_ stock visualization, 
affecting how it is displayed in the visualizations menu of applications:

```js
var ruleSpec = {
  select: {
    module: "pentaho/visual/models/Bar"
  },
  apply: {
    label: "Vertical Bars"
  }
};
```

Note that it is a best practice to load localizable text from a resource bundle. 
You can use the [Localization]({{site.refDocsUrlPattern | replace: '$', 'pentaho.i18n'}}) API to that end.

## Examples of typical view configurations

Note that view configuration is typically tied to the technology with which views are built.
You should consult the view documentation to find out about which configuration properties it supports.

The views of stock visualizations are implemented using the 
[CCC](https://community.hitachivantara.com/docs/DOC-1009860) charting library,
and can be customized using its rich set of extension points, 
by specifying these in an object in the `extension` configuration property.

### Thicken the axes rules of stock visualizations

The following rule changes the 
[lineWidth](http://webdetails.github.io/ccc/charts/jsdoc/symbols/pvc.options.marks.RuleExtensionPoint.html#lineWidth)
property of the 
[baseAxisRule_](http://webdetails.github.io/ccc/charts/jsdoc/symbols/pvc.options.ext.FlattenedDiscreteCartesianAxisExtensionPoints.html#rule)
and
`orthoAxisRule_` 
extension points,
of any applicable stock visualizations,
in any application:

```js
var ruleSpec = {
  select: {
    module: "pentaho/ccc/visual/Abstract"
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
[font](http://webdetails.github.io/ccc/charts/jsdoc/symbols/pvc.options.marks.LabelExtensionPoint.html#font)
property of the 
[baseAxisLabel_](http://webdetails.github.io/ccc/charts/jsdoc/symbols/pvc.options.ext.FlattenedDiscreteCartesianAxisExtensionPoints.html#label)
and
`orthoAxisLabel_` 
extension points,
of any applicable stock visualizations,
when in the PDI application:

```js
var ruleSpec = {
  select: {
    module: "pentaho/ccc/visual/AreaStacked",
    application: "pentaho/det"
  },
  apply: {
    extension: {
      baseAxisLabel_font: "12px OpenSansRegular",
      orthoAxisLabel_font: "12px OpenSansRegular"
    }
  }
};
```

## Examples of color palette configurations

### Change the colors of the default discrete color palette

The following rule changes the 
[colors]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.color.Palette' | append: '#colors'}})
of the default nominal color palette,
[pentaho.visual.color.palettes.nominalPrimary]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.color.palettes' | append: '#.nominalPrimary'}}),
in any application:

```js
var ruleSpec = {
  select: {
    module: "pentaho/visual/color/palettes/nominalPrimary"
  },
  apply: {
    colors: [
      "red", "#00FF00", "rgb(0,0,255)"
    ]
  }
};
```

### Change the colors used by a certain visualization

The following rule changes the default value of the `palette` property
of the stock bar chart visualization, in any application, 
so that a specific _ad hoc_ palette is used:

```js
var ruleSpec = {
  select: {
    module: "pentaho/visual/models/Bar"
  },
  apply: {
    props: {
      palette: {
        defaultValue: {
          level: "nominal",
          colors: ["red", "#00FF00", "rgb(0,0,255)"]
        }
      }
    }
  }
};
```

If, instead, you want to use a registered palette:

```js
var ruleSpec = {
  select: {
    module: "pentaho/visual/models/Bar"
  },
  deps: [
    "pentaho/visual/color/palettes/nominalLight"
  ],
  apply: function(nominalLightPalette) {
    return {
      props: {
        palette: {
          defaultValue: nominalLightPalette
        }
      }
    };
  }
};
```

## Identifiers of Stock Visualizations

The _models_ of stock visualizations are all sub-modules of the `pentaho/visual/models` module. 
For example, `pentaho/visual/models/Line`, is the identifier of the stock Line visualization model.

The corresponding CCC-based _view_ of a stock visualization is a sub-module of the `pentaho/ccc/visual` module. 
For example, `pentaho/ccc/visual/Line`, is the identifier of the CCC view corresponding to 
the stock Line visualization model.

| Local Module Id.          | Description              |
|---------------------------|--------------------------|
| `Abstract`                | All stock visualizations |
| `AreaStacked`             | Area Stacked             |
| `Line`                    | Line                     |
| `Bar`                     | Column                   |
| `BarStacked`              | Column Stacked           |
| `Bar`                     | Column Stacked 100%      |
| `BarHorizontal`           | Bar                      |
| `BarStackedHorizontal`    | Bar Stacked              |
| `BarNormalizedHorizontal` | Bar Stacked 100%         |
| `BarLine`                 | Column/Line Combo        |
| `Scatter`                 | X/Y Scatter              |
| `Bubble`                  | Bubble                   |
| `HeatGrid`                | Heat-Grid                |
| `Pie`                     | Pie                      |
| `Donut`                   | Donut                    |
| `Sunburst`                | Sunburst                 |

The Geo Map visualization is the exception to these rules.
Its model's identifier is `pentaho/geo/visual/Model`
and its view's identifier is `pentaho/geo/visual/View`.

## Identifiers of Stock Color Palettes

All stock color palettes are sub-modules of the `pentaho/visual/color/palettes` module.
For example, `pentaho/visual/color/palettes/nominalPrimary`, 
is the identifier of the default discrete color palette.

| Local Module Id.        |
|-------------------------|
| `nominalPrimary`        |
| `nominalNeutral`        |
| `nominalLight`          |
| `nominalDark`           |
| `quantitativeBlue3`     |
| `quantitativeBlue5`     |
| `quantitativeGray3`     |
| `quantitativeGray5`     |
| `divergentRyb3`         |
| `divergentRyb5`         |
| `divergentRyg3`         |
| `divergentRyg5`         |
