---
title: Step 4 - Styling the view
description: Walks you through the styling of the Bar visualization view.
parent-path: .
parent-title: Bar/D3 Visualization in Sandbox
grand-parent-title: Create a Custom Visualization
grand-parent-path: ../../create
grand-grand-parent-title: Visualization API
grand-grand-parent-path: ../..
layout: default
---

Noticed that before you added CSS classes to some of the SVG elements? 
Let's then give some love to the Bar chart by styling these elements with CSS.

## Creating the CSS file

Create a folder named `css` and, in it, create a file named `ViewD3.css`. Add the following content to it:

```css
.pentaho-visual-samples-bar-d3 .bar {
  stroke-width: 2px;
}

.pentaho-visual-samples-bar-d3 .bar:hover {
  fill-opacity: 0.8;
}

.pentaho-visual-samples-bar-d3 .axis path,
.pentaho-visual-samples-bar-d3 .tick line {
  stroke: #cbdde8;
}

.pentaho-visual-samples-bar-d3 .tick text {
  font-family: OpenSansLight, Helvetica, Arial, Sans serif;
  fill: #26363d;
}

.pentaho-visual-samples-bar-d3 .title {
  font-family: OpenSansLight, Helvetica, Arial, Sans serif;
  font-size: 18px;
  font-style: normal;
  fill: #005f7d;
}
```

Remarks:
  - The CSS rules are scoped with the visualization model's
    CSS [style class]({{site.refDocsUrlPattern | replace: '$', 'pentaho.type.Type' | append: '#styleClass'}}), 
    previously specified when defining the model.

## Loading the CSS file with the view

To load the view's CSS file dynamically, whenever the view module is loaded, use the `css` AMD/RequireJS plugin.
Modify the AMD module declaration of the `ViewD3.js` file to the following:

```js
define([
  "pentaho/module!_",
  "pentaho/visual/impl/View",
  "./Model",
  "d3",
  "pentaho/visual/scene/Base",
  "css!./css/ViewD3"
], function(module, BaseView, BarModel, d3, Scene) {
  // ...
});
```

Now, refresh the `sandbox.html` page in the browser, and you should see a better styled title and hover effects on the bars!

**Continue** to [Model styling for applications](step5-model-styling).
