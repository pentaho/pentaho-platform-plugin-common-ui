---
title: Step 2 - Creating the model
description: Walks you through the creation of the Bar visualization model.
parent-path: .
parent-title: Bar/D3 Visualization in Sandbox
grand-parent-title: Create a Custom Visualization
grand-parent-path: ../../create
grand-grand-parent-title: Visualization API
grand-grand-parent-path: ../..
layout: default
---

## Quick facts on Bar charts

The simplest of Bar charts shows a single _series_ of data: 
a list of pairs of a category and a measure, where each category can only occur in one of the pairs.

Each pair (i.e. each category) is represented by a _bar_ visual element, 
and is assigned a stripe of the horizontal space and all of the vertical space, 
in which the height of the bar encodes the measure value.

Thus, the simplest Bar chart has two main data-bound visual degrees of freedom, or, 
as they are called in the Visualization API, **visual roles**: 
_Category_ and _Measure_.
The values of the fields mapped to visual roles are visually encoded using visual variables/properties such as 
position, size, orientation or color.

## Complete model code

Create a file named `model.js` and place the following code in it:

```js
define([
  "module"
], function(module) {
  "use strict";

  return ["pentaho/visual/base/Model", function(BaseModel) {
    // Create the Bar Model subclass
    var BarModel = BaseModel.extend({
      $type: {
        id: module.id,

        // CSS class
        styleClass: "pentaho-visual-samples-bar-d3",

        // The label may show up in menus
        label: "D3 Bar Chart",

        // The default view to use to render this visualization is
        // a sibling module named `View-d3.js`
        defaultView: "./View-d3",

        // Properties
        props: [
          // General properties
          {
            name: "barSize",
            valueType: "number",
            defaultValue: 30,
            isRequired: true
          },

          // Visual role properties
          {
            name: "category",
            base: "pentaho/visual/role/property",
            fields: {isRequired: true}
          },
          {
            name: "measure",
            base: "pentaho/visual/role/property",
            modes: [{dataType: "number"}],
            fields: {isRequired: true}
          },

          // Palette property
          {
            name: "palette",
            base: "pentaho/visual/color/PaletteProperty",
            levels: "nominal",
            isRequired: true
          }
        ]
      }
    });

    return BarModel;
  }];
});
```

Remarks:
  - The value of the AMD module is an array of dependencies and of a factory function 
    of Bar model classes.
  - Defines a visualization (model) whose id is the file's AMD module identifier
    (depending on how AMD is configured, it can be, for example: `pentaho-visual-samples-bar-d3/model`).
  - Inherits directly from the base visualization model, 
    [pentaho/visual/base/model]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.base.Model'}}).
  - Specifies the [styleClass]({{site.refDocsUrlPattern | replace: '$', 'pentaho.type.Type' | append: '#styleClass'}}),
    which will later be useful to style the component using CSS.
  - Specifies the
    [default view]({{site.refDocsUrlPattern | replace: '$', 'pentaho.type.Type' | append: '#defaultView'}}) 
    to use with this model (which you'll create in a moment).
  - Three main types of property exist: general, visual roles and palettes.

The following sections explain each of the model properties.

## The `barSize` property

```js
specification = {
  name: "barSize",
  valueType: "number",
  defaultValue: 30,
  isRequired: true
}
```

A general property which determines the constant width of bars. 
It is of 
[valueType]({{site.refDocsUrlPattern | replace: '$', 'pentaho.type.Property.Type' | append: '#valueType'}})
[number]({{site.refDocsUrlPattern | replace: '$', 'pentaho.type.Number'}}), 
is [required]({{site.refDocsUrlPattern | replace: '$', 'pentaho.type.Property.Type' | append: '#isRequired'}}) and 
has a 
[defaultValue]({{site.refDocsUrlPattern | replace: '$', 'pentaho.type.Property.Type' | append: '#defaultValue'}}) 
of `30`.
That's as simple as it gets.

## The `category` property

```js
specification = {
  name: "category",
  base: "pentaho/visual/role/property",
  fields: {isRequired: true}
}
```

Represents the _Category_ visual role.
The property is of a special type, 
a [visual role property]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.role.Property'}}).

The [data]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.base.Model' | append: '#data'}}) property, 
which is inherited from the base visualization model, 
is given a dataset containing data for fields such as _Product Family_ and _Sales_.
The value of a visual role contains the names of the fields that are _mapped_ to it,
e.g.: `{fields: ["productFamily"]}`. 
So, the value of a visual role is an object with a list property named 
[fields]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.role.Mapping' | append: '#fields'}}).

The [modes]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.role.PropertyType' | append: '#modes'}})
attribute was not specified. It defaults to a single mode of the `"string"` data type.
Thus, the visual role will accept being mapped to fields of type `"string"`. 

Because the default data type is `"string"`, 
the visual role can be mapped to at most one `"string"` field 
(for it to accept more than one `"string"` field, 
it would need to have the "list of strings" data type: "`["string"]`).
However, it is optional by default. To make it required, 
the special 
[fields]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.role.Property.Type' | append: '#fields'}})
attribute is configured.

## The `measure` property

```js
specification = {
  name: "measure",
  base: "pentaho/visual/role/property",
  modes: [{dataType: "number"}],
  fields: {isRequired: true}
}
```

Represents the _Measure_ visual role. 
Having a single mode with the `"number"` data type, 
the visual role accepts a single field of data type `"number"`. 

## The `palette` property

```js
specification = {
  name: "palette",
  base: "pentaho/visual/color/PaletteProperty",
  levels: "nominal",
  isRequired: true
}
```

Represents a color palette 
(see [pentaho/visual/color/PaletteProperty]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.color.PaletteProperty'}})).

The value of the property will default to the highest ranked system color palette that 
matches the [level]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.color.PaletteProperty.Type#levels'}}) required by it.

## Register the model module

Your visualization must be advertised to the platform so that applications like Analyzer and PDI can offer it to users.
This is done by registering 
the visualization's [`Model`]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.base.Model'}}) module
with [`pentaho/modules`]({{site.refDocsUrlPattern | replace: '$', 'pentaho.modules'}}),
as a subtype of `pentaho/visual/base/Model`.

For such, edit the `package.json` file and make sure it looks like this:

```json
{
  "name": "pentaho-visual-samples-bar-d3",
  "version": "0.0.1",

  "config": {
    "pentaho/modules": {
      "pentaho-visual-samples-bar-d3/Model": {
        "base": "pentaho/visual/base/Model"
      }
    }
  },

  "dependencies": {
    "d3": "^4.11.0"
  },
  "bundleDependencies": [
    "d3"
  ],
  "devDependencies": {
    "@pentaho/viz-api": "https://github.com/pentaho/pentaho-platform-plugin-common-ui/releases/download/v3.0.0-beta2/pentaho-viz-api-v3.0.0.tgz"
  }
}
```

Note the added `config` property.

## Additional model metadata

The model could still be enriched in several ways, such as:

- Providing localized labels/descriptions for the name of the visualization and that of its properties.
- Providing standard icons for supported Pentaho themes.

However, these are all accessory and can be done at a later stage.
Now you can't wait to see something shining on the screen, so let's move on into creating the view.

**Continue** to [Creating the view](step3-view-creation).
