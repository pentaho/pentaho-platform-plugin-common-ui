---
title: Step 2 - Creating the model
description: Walks you through the creation of the Bar visualization model.
parent-path: .
parent-title: Bar/D3 Visualization in Sandbox
layout: 7.1_default
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
The values of the attributes mapped to visual roles are visually encoded using visual variables/properties such as 
position, size, orientation or color.

## Complete model code

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
        id: module.id,
        styleClass: "pentaho-visual-samples-bar",
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
  - Defines a visualization (model) whose id is the file's AMD module identifier
    (depending on how AMD is configured, it can be, for example: `pentaho/visual/samples/bar/model`).
  - Inherits directly from the base visualization model, 
    [pentaho/visual/base]({{site.refDocsUrlPattern7 | replace: '$', 'pentaho.visual.base.Model'}}).
  - Specifies the [styleClass]({{site.refDocsUrlPattern7 | replace: '$', 'pentaho.type.Type' | append: '#styleClass'}}),
    which will later be useful to style the component using CSS.
  - Specifies the
    [default view]({{site.refDocsUrlPattern7 | replace: '$', 'pentaho.type.Type' | append: '#defaultView'}}) 
    to use with this model (which you'll create in a moment).
  - Two main types of property exist: general and visual roles.
  
The following sections explain each of the model properties.
  
## The `barSize` property

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
[type]({{site.refDocsUrlPattern7 | replace: '$', 'pentaho.type.Property.Type' | append: '#type'}})
[number]({{site.refDocsUrlPattern7 | replace: '$', 'pentaho.type.Number'}}), 
is [required]({{site.refDocsUrlPattern7 | replace: '$', 'pentaho.type.Property.Type' | append: '#isRequired'}}) and 
has a 
[default value]({{site.refDocsUrlPattern7 | replace: '$', 'pentaho.type.Property.Type' | append: '#value'}}) 
of `30`.
That's as simple as it gets.

## The `category` property

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
Being [ordinal]({{site.refDocsUrlPattern7 | replace: '$', 'pentaho.visual.role.OrdinalMapping'}}) 
means that it can visually encode discrete values 
and their relative order.

The [data]({{site.refDocsUrlPattern7 | replace: '$', 'pentaho.visual.base.Model' | append: '#data'}}) property, 
which is inherited from the base visualization model, 
is given a dataset containing data for attributes such as _Product Family_ and _Sales_.
The value of a visual role contains the names of the data attributes that are _mapped_ to it,
e.g.: `{attributes: ["productFamily"]}`. 
So, the value of a visual role is an object with a list property named 
[attributes]({{site.refDocsUrlPattern7 | replace: '$', 'pentaho.visual.role.BaseMapping' | append: '#attributes'}}).

Because by default, any number of data attributes can be mapped to a visual role, including 0 or 10, 
it is necessary to derive the 
[pentaho/visual/role/ordinal]({{site.refDocsUrlPattern7 | replace: '$', 'pentaho.visual.role.OrdinalMapping'}}) 
visual role type to limit the cardinality 
limits of its `attributes` property, so that it accepts and requires a single data attribute.

## The `measure` property

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
Being [quantitative]({{site.refDocsUrlPattern7 | replace: '$', 'pentaho.visual.role.QuantitativeMapping'}}) 
means that it can visually represent the proportion between values (_this is twice that_).
The quantitative data types are 
[date]({{site.refDocsUrlPattern7 | replace: '$', 'pentaho.type.Date'}})
and 
[number]({{site.refDocsUrlPattern7 | replace: '$', 'pentaho.type.Number'}}).
The [dataType]({{site.refDocsUrlPattern7 | replace: '$', 'pentaho.visual.role.Mapping.Type' | append: '#dataType'}})
property is used to only allow mapping to data attributes of type `number`.

## Additional model metadata

The model could still be enriched in several ways, such as:

- Providing localized labels/descriptions for the name of the visualization and that of its properties.
- Providing standard icons for supported Pentaho themes.

However, these are all accessory and can be done at a later stage.
Now you can't wait to see something shining on the screen, so let's move on into creating the view.

**Continue** to [Creating the view](step3-view-creation).
