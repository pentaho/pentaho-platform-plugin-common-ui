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
[execute]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.action.Execute'}}) and
[select]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.action.Select'}}).
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
Modify the AMD module declaration of the `ViewD3.js` file to the following:

```js
define([
  "pentaho/module!_",
  "pentaho/visual/base/View",
  "./Model",
  "pentaho/visual/action/Execute",
  "d3",
  "./clickD3",
  "pentaho/visual/scene/Base",
  "css!./css/viewD3"
], function(module, BaseView, BarModel, ExecuteAction, d3, d3ClickController, Scene) {
  // ...
});
```

### Handle the `dblclick` event

Now, you'll handle the `dblclick` event of the SVG rect elements — the bars.
Add the following code to the `_updateAll` method:

```js
// ViewD3.js
// _updateAll:
function() {
  // Part 1 & 2
  // ...
  
  // Part 3
  var view = this;
  
  bar.on("dblclick", function(scene) {
    // A filter that would select the data that the bar visually represents
    var filter = scene.createFilter();

    // Create the action.
    var action = new ExecuteAction({dataFilter: filter});

    // Dispatch the action through the view.
    view.act(action);
  });
}
```

Remarks:
  - The scene object knows how to create a filter for the data it represents
    (see [createFilter]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.scene.Base' | append: '#createFilter'}})). 
  - The action is being dispatched through the view, where action listeners can handle it. 

### Handling of the `Execute` action event

The `Execute` action event is already being handled on the sandbox side, 
helping you to easily check that the action is being dispatched.

In the `sandbox.html` file you can find the following statements:

```js
view.on("pentaho/visual/action/Execute", {
  "do": function(action) {
    alert("Executed " + action.dataFilter.$contentKey);
  }
});
```

Remarks:
  - Actions emit events whose _type_ is the id of the action's type.
  - Actions emit _structured_ events, composed of multiple phases; you're handling its `do` phase.
  - Action listener functions receive the action as argument.
  - The filter's 
    [$contentKey]({{site.refDocsUrlPattern | replace: '$', 'pentaho.data.filter.Abstract' | append: '#$contentKey'}})
    property provides an easy way to get a human-readable description of a filter.

What are you waiting for? 
Refresh the `sandbox.html` page in the browser, and double-click a bar!

## Implementing the `Select` action

The `Select` action is an _auxiliary_ action.
Its goal is to mark a subset of data on which, later, a _real_ action, such as drilling-down, is performed.
The current set of selected data is stored in the model's 
[selectionFilter]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.base.Model' | append: '#selectionFilter'}})
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

### Declare the dependency on the `Select` action

The `Select` action type module needs to be loaded with the view module.
Modify the type factory declaration of the `ViewD3.js` file to the following:

```js
define([
  "pentaho/module!_",
  "pentaho/visual/base/View",
  "./Model",
  "pentaho/visual/action/Execute",
  "pentaho/visual/action/Select",
  "d3",
  "./clickD3",
  "pentaho/visual/scene/Base",
  "css!./css/viewD3"
], function(module, BaseView, BarModel, ExecuteAction, SelectAction, d3, d3ClickController, Scene) {
  // ...
});
```

### Handle the `click` event

Now, you'll handle the `click` event of the SVG rect elements, the bars.
Add the following code to the `_updateAll` method:

```js
// ViewD3.js
// _updateAll:
function() {
  // Part 1 & 2 & 3
  // ...
  
  // Part 4
  bar.on("click", function(d) {
    // A filter that would select the data that the bar visually represents
    var filter = scene.createFilter();

    // Create the action.
    var action = new SelectAction({
      dataFilter: filter, 
      selectionMode: event.ctrlKey || event.metaKey ? "toggle" : "replace"
    });

    // Dispatch the action through the view.
    view.act(action);
  });
}
```

Remarks:
  - Each time a bar is clicked, the current model's `selectionFilter` will be 
    [replaced]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.action' | append: '#.SelectionModes'}})
    with the data filter associated with the clicked bar, or 
    [toggled]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.action' | append: '#.SelectionModes'}})
    if the ctrl/cmd key is pressed.

### Handling of the `Select` action event

The `Select` action event is also being handled on the sandbox side.

In `sandbox.html` you can analyze this block of code:

```js
view.on("pentaho/visual/action/Select", {
  "finally": function(action) {
    document.getElementById("messages_div").innerText =
      "Selected: " + view.model.selectionFilter.$contentKey;
  }
});
```

Remarks:
  - You're handling the `finally` phase of the `Select` action, the last phase, that is called whatever happens.
  - The `Select` action's 
    [default action]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.action.Select' | append: '#_doDefault'}})
    automatically processes the action's `dataFilter` and `selectionMode` and applies it to the model's
    `selectionFilter`. We are using the content's of the model's `selectionFilter` property for displaying the final result.

Refresh the `sandbox.html` page in the browser, and click a bar!
You should see a text under the visualization showing the selected data's filter.

### Render selected bars differently

It would be much nicer if bars where highlighted with a different color when selected. Let's do that.

#### Edit the CSS file

Edit the `viewD3.css` file. Append the following rules to it:

```css
.pentaho-visual-samples-bar-d3 .bar.selected {
  stroke-opacity: 0.4;
  fill-opacity: 0.6;
}

.pentaho-visual-samples-bar-d3 .bar.selected:hover {
  stroke-opacity: 0.8;
}
```

#### Change the render code

Finally, add the following code to the `_updateAll` method:

```js
// ViewD3.js
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

{% include callout.html content='
<h2 id="conflicting-click-and-double-click-events">Conflicting Click and Double-click events</h2>
<p>You might have noticed that when double-clicking, apart from the <code class="highlighter-rouge">dblclick</code> event, 
two other <code class="highlighter-rouge">click</code> events are being triggered. 
This is a known issue of DOM events and there are multiple workarounds.</p>
<p>Check the code at the sample repository for a possible solution, based on
<a href="http://bl.ocks.org/ropeladder/83915942ac42f17c087a82001418f2ee" target="_black">Distinguishing click and double-click in D3</a>.</p>
' type="warning" %}

**Continue** to [Adding a default configuration](step7-default-configuration).
