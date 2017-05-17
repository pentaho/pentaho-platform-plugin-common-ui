---
title: Create a custom Bar chart visualization using D3
description: Walks you through the creation of a simple Bar chart visualization that uses the D3 graphics library.
parent-title: Visualization API
parent-path: ../..
layout: default
---

This walk-through will guide you through the creation of a simple Bar chart visualization, 
using the Pentaho Visualization API and the amazing [D3](https://d3js.org/) graphics library.
 
The complete code of this sample is available at 
[pentaho/pentaho-engineering-samples]({{site.platformSamplesBaseUrl | append: "javascript-apis/platform/pentaho/visual/samples/bar-d3-sandbox"}}).

## Prerequisites

- Basic JavaScript knowledge
- Basic D3 knowledge
- An npm registry compatible package manager like [npm](https://www.npmjs.com) or [yarn](https://yarnpkg.com).

## Parts

The walk-through is divided in the following parts:

1. [Preparing the environment](part1-environment-preparing)
2. [Creating the model](part2-model-creating)
3. [Creating the view](part3-view-creating)
4. [Styling the view](part4-view-styling)
5. [Adding interactivity to the view](part5-view-interactivity)
6. [Adding a default configuration](part6-default-configuration)
7. [Next steps](partN-next-steps)

TODO MOVE

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

## Next steps

You've covered the basics of developing a visualization for the Pentaho Visualization API.
Many features, such as color palettes, localization, theming and configuration, were purposely left out, 
to keep things as accessible as possible.
