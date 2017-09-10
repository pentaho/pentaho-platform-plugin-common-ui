---
title: Step 4 - Styling the view
description: Walks you through the styling of the Bar visualization view.
parent-path: .
parent-title: Bar/D3 Visualization in Sandbox
layout: default
---

Noticed that before you added CSS classes to some of the SVG elements? 
Let's then give some love to the Bar chart by styling these elements with CSS.

## Creating the CSS file

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
    previously specified when defining the model.

## Loading the CSS file with the view

To load the view's CSS file dynamically, whenever the view module is loaded, use the `css` AMD/RequireJS plugin.
Modify the AMD module declaration of the `view-d3.js` file to the following:

```js
define([
  "module", 
  "d3",
  "css!./css/view-d3"
], function(module, d3) {

  // ...
});
```

Now, refresh the `index.html` page in the browser, and you should see a more colorful Bar chart!

**Continue** to [Adding interactivity to the view](step5-view-interactivity).
