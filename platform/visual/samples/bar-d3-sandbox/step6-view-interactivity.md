---
title: Step 6 - Adding interactivity to the view
description: Walks you through adding interactivity to the Bar visualization view.
parent-path: .
parent-title: Bar/D3 Visualization in Sandbox
grand-parent-title: Create a Custom Visualization
grand-parent-path: ../../create
grand-grand-parent-title: Visualization API
grand-grand-parent-path: ../..
layout: default
---

Visualizations can be much more fun and useful if the user is able to interact with them.
The Visualization API defines two standard types of actions: 
[Execute]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.action.Execute'}}) and
[Select]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.action.Select'}}).
Most container applications handle these in some useful way.

## On data actions and filters...

Visualization API 
[data actions]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.action.mixins.Data'}}) 
carry information that _identifies_ the visual element with which the user interacted 
in terms of the subset of data that it visually represents.
This is conveyed in their
[dataFilter]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.action.mixins.Data' | append: '#dataFilter'}})
property.

In this visualization, 
because 
each bar represents a category of the data, 
and the _Category_ visual role is mapped to a single field, 
then 
each bar corresponds to a distinct value of the mapped field.

## Implementing the `Execute` action

The `execute` action is typically performed in response to a double-click event on the main visual elements,
in this case, the bars.

### Declare the dependency on the `Execute` action

The `Execute` action type module needs to be loaded with the view module.
Modify the AMD/RequireJS module declaration of the `View.js` file to the following:

```js
define([
  "pentaho/module!_",
  "pentaho/visual/impl/View",
  "d3",
  "pentaho/visual/scene/Base",
  "./clickD3"
], function(module, BaseView, d3, Scene, d3ClickController) {
  // ...
});
```

The `clickD3.js` file can be obtained from
[pentaho/pentaho-engineering-samples]({{site.platformSamplesBaseUrl | append: "javascript-apis/platform/visual-samples-bar-d3/clickD3.js"}}).
Place it besides the `View.js` file.

This file provides a _click controller_ for D3,
which handles the correct distinction between click and double-click events.

### Handle the `dblclick` event

Now, you'll handle the `dblclick` event of the SVG rect elements — the bars.
Add the following code to the `_updateAll` method:

```js
// View.js
// _updateAll:
function() {
  // Part 1 & 2
  // ...
  
  // Part 3
  var cc = d3ClickController();
  bar.call(cc);
    
  cc.on("dblclick", function(event, scene) {
    // A filter that selects the data that the bar visually represents
    var filter = scene.createFilter();
    
    // Dispatch an "Execute" action through the model
    model.execute({dataFilter: filter});
  });
}
```

Remarks:
  - The `scene` object knows how to create a filter for the data it represents
    (see 
    [createFilter]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.scene.Base' | append: '#createFilter'}}),
    for more information). 
  - The 
    [execute]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.Model' | append: '#execute'}})
    method creates and dispatches an execute action through the model, 
    where action listeners can handle it. 

What are you waiting for? 
Refresh the `sandbox.html` page in the browser, and double-click a bar!

## Implementing the `Select` action

The `Select` action is an _auxiliary_ action.
Its goal is to mark a subset of data on which, later, a _real_ action, such as drilling-down, is performed.
The current set of selected data is stored in the model's 
[selectionFilter]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.Model' | append: '#selectionFilter'}})
property.
For each `Select` action that is performed, 
its [dataFilter]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.action.Select' | append: '#dataFilter'}}), 
may be removed from, be added to, replace or toggled in the model's current `selectionFilter`, 
according to the action's 
[selectionMode]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.action.Select' | append: '#selectionMode'}}).

Visualizations typically highlight visual elements that represent data that is selected.
Container applications typically expose actions, from which the user can choose,
to be performed on the currently selected subset of data.

You'll let the user _select_ bars by clicking on them.

### Handle the `click` event

Now, you'll handle the `click` event of the SVG rect elements, the bars.
Add the following code to the `_updateAll` method:

```js
// View.js
// _updateAll:
function() {
  // Part 1 & 2 & 3
  // ...
  
  // Part 4
  cc.on("click", function(event, scene) {
    // A filter that selects the data that the bar visually represents
    var filter = scene.createFilter();
    
    // Dispatch a "Select" action through the model
    model.select({
      dataFilter: filter,
      selectionMode: event.ctrlKey || event.metaKey ? "toggle" : "replace"
    });
  });
}
```

Remarks:
  - Each time a bar is clicked, the current model's `selectionFilter` will be 
    [replaced]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.action' | append: '#.SelectionModes'}})
    with the data filter associated with the clicked bar, or 
    [toggled]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.action' | append: '#.SelectionModes'}})
    if the ctrl/cmd key is pressed.

Refresh the `sandbox.html` page in the browser, and click a bar!
You should see a text under the visualization showing the selected data's filter.

### Render selected bars differently

It would be much nicer if bars where highlighted with a different color when selected.
Let's do that.

#### Edit the CSS file

Edit the `View.css` file. Append the following rules to it:

```css
._pentaho-visual-samples-bar-d3-pentaho-visual-samples-bar-D3-View .bar.selected {
  stroke-opacity: 0.4;
  fill-opacity: 0.6;
}

._pentaho-visual-samples-bar-d3-pentaho-visual-samples-bar-D3-View .bar.selected:hover {
  stroke-opacity: 0.8;
}
```

#### Change the render code

Finally, add the following code to the `_updateAll` method:

```js
// View.js
// _updateAll:
function() {
  // Part 1 & 2 & 3 & 4
  // ...
  
  // Part 5
  bar.classed("selected", function(scene) {
    var selectionFilter = model.selectionFilter;
    return !!selectionFilter && dataTable.filterMatchesRow(selectionFilter, scene.index);
  });
}
```

Refresh the `sandbox.html` page in the browser, and click a bar!
You should see the selected bar exhibiting different colors.

**Continue** to [Adding a default configuration](step7-default-configuration).
