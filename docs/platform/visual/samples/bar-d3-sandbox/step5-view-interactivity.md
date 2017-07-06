---
title: Step 5 - Adding interactivity to the view
description: Walks you through adding interactivity to the Bar visualization view.
parent-path: .
parent-title: Bar/D3 Visualization in Sandbox
layout: default
---

Visualizations can be much more fun and useful if the user is able to interact with them.
The Visualization API defines two standard types of actions: 
[execute]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.action.Execute'}}) and
[select]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.action.Select'}}).
Most container applications handle these in some useful way.

## On data actions and filters...

Visualization API 
[data actions]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.action.Data'}}) 
carry information that _identifies_ the visual element with which the user interacted 
in terms of the subset of data that it visually represents.
This is conveyed in their
[dataFilter]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.action.Data' | append: '#dataFilter'}})
property.

In this visualization, 
because 
each bar represents a category of the data, 
and the _Category_ visual role is mapped to a single data attribute, 
then 
each bar corresponds to a distinct value of the mapped data attribute.

## Implementing the `execute` action

The `execute` action is typically performed in response to a double-click event on the main visual elements,
in this case, the bars.

### Declare the dependency on the `execute` action

The `execute` action type module needs to be loaded with the view module.
Modify the AMD module declaration of the `view-d3.js` file to the following:

```js
define([
  "module",
  "pentaho/visual/base/view",
  "./model",
  "pentaho/visual/action/execute",
  "d3",
  "css!./css/view-d3",
], function(module, baseViewFactory, barModelFactory, executeActionFactory, d3) {
  // ...
});
```

### Handle the `dblclick` event

Now, you'll handle the `dblclick` event of the SVG rect elements — the bars.
Add the following code to the `_updateAll` method:

```js
// view-d3.js
// _updateAll:
function() {
  // Part 1 & 2
  // ...
  
  // Part 3
  var view = this;
  var context = this.type.context;

  bar.on("dblclick", function(d) {
    
    var filterSpec = {_: "=", property: categoryAttribute, value: d.category};

    var ExecuteAction = context.get(executeActionFactory);
    var action = new ExecuteAction({dataFilter: filterSpec});

    view.act(action);
  });
}
```

Remarks:
  - An [isEqual]({{site.refDocsUrlPattern | replace: '$', 'pentaho.data.filter.IsEqual'}}) 
    filter is being created; `=` is the alias of the filter type. 
  - The action is being dispatched through the view, where action listeners can handle it. 

### Handle the `execute` action event

Finally, you'll handle the `execute` action event from the sandbox side, 
so that it is clear that the action is being dispatched.

In `index.html`, find the statement `view.update()`. 
Just before it, add the following:

```js
view.on("pentaho/visual/action/execute", {
  "do": function(action) {
    alert("Executed " + action.dataFilter.contentKey);
  }
});
```

Remarks:
  - Actions emit events whose _type_ is the id of the action's type.
  - Actions emit _structured_ events, composed of multiple phases; you're handling its `do` phase.
  - Action listener functions receive the action as argument.
  - The filter's 
    [contentKey]({{site.refDocsUrlPattern | replace: '$', 'pentaho.data.filter.Abstract' | append: '#contentKey'}})
    property provides an easy way to get a human-readable description of a filter.

What are you waiting for? 
Refresh the `index.html` page in the browser, and double-click a bar!

## Implementing the `select` action

The `select` action is an _auxiliary_ action.
Its goal is to mark a subset of data on which, later, a _real_ action, such as drilling-down, is performed.
The current set of selected data is stored in the view's 
[selectionFilter]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.base.View' | append: '#selectionFilter'}})
property.
For each `select` action that is performed, 
its [dataFilter]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.action.Data' | append: '#dataFilter'}}), 
may be removed from, be added to, replace or toggled in the view's current `selectionFilter`, 
according to the action's 
[selectionMode]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.action.Select' | append: '#selectionMode'}}).

Visualizations typically highlight visual elements that represent data that is selected.
Container applications typically expose actions, from which the user can choose,
to be performed on the currently selected subset of data.

You'll let the user _select_ bars by clicking on them.

### Declare the dependency on the `select` action

The `select` action type module needs to be loaded with the view module.
Modify the AMD module declaration of the `view-d3.js` file to the following:

```js
define([
  "module",
  "pentaho/visual/base/view",
  "./model",
  "pentaho/visual/action/execute",
  "pentaho/visual/action/select",
  "d3",
  "css!./css/view-d3",
], function(module, baseViewFactory, barModelFactory, executeActionFactory, selectActionFactory, d3) {
  // ...
});
```

### Handle the `click` event

Now, you'll handle the `click` event of the SVG rect elements, the bars.
Add the following code to the `_updateAll` method:

```js
// view-d3.js
// _updateAll:
function() {
  // Part 1 & 2 & 3
  // ...
  
  // Part 4
  bar.on("click", function(d) {
    
    var filterSpec = {_: "=", property: categoryAttribute, value: d.category};

    var SelectAction = context.get(selectActionFactory);
    var action = new SelectAction({dataFilter: filterSpec, selectionMode: "replace"});

    view.act(action);
  });
}
```

Remarks:
  - Each time a bar is clicked, the current view's `selectionFilter` will be 
    [replaced]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.action' | append: '#.SelectionModes'}})
    with the data filter associated with the clicked bar.

### Handle the `select` action event

You'll handle the `select` action event from the sandbox side, 
so that it is clear that the action is being dispatched.

In `index.html`, find the markup `<div id="viz_div"></div>`. 
Immediately after it, add the following:

```html
   <div id="messages_div"></div>
```

Again, in `index.html`, find the statement `view.update()`. 
Just before it, add the following:

```js
view.on("pentaho/visual/action/select", {
  "finally": function(action) {
    document.getElementById("messages_div").innerText = "Selected: " + action.dataFilter.contentKey;
  }
});
```

Remarks:
  - You're handling the `finally` phase of the `select` action, the last phase, that is called whatever happens.
  - The `select` action's 
    [default action]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.action.Select' | append: '#_doDefault'}})
    automatically processes the action's `dataFilter` and `selectionMode` and applies it to the view's
    `selectionFilter`. Alternatively, you could show the content's of the view's `selectionFilter` property.

Refresh the `index.html` page in the browser, and click a bar!
You should see a text under the visualization showing the selected data's filter.

### Render selected bars differently

It would be much nicer if bars where highlighted with a different color when selected. Let's do that.

#### Edit the CSS file

Edit the `view-d3.css` file. Append the following rules to it:

```css
.pentaho-visual-samples-bar .bar.selected {
  fill: #97372d;
}

.pentaho-visual-samples-bar .bar.selected:hover {
  fill: #970a05;
}
```

#### Change the render code

Finally, add the following code to the `_updateAll` method:

```js
// view-d3.js
// _updateAll:
function() {
  // Part 1 & 2 & 3 & 4
  // ...
  
  // Part 5
  bar.classed("selected", function(d) {
    var selectionFilter = view.selectionFilter;
    return !!selectionFilter && dataTable.filterMatchesRow(selectionFilter, d.rowIndex);
  });
}
```

Refresh the `index.html` page in the browser, and click a bar!
You should see the selected bar exhibiting different colors.

## Conflicting Click and Double-click events

You might have noticed that, when double-clicking, apart from the `dblclick` event, 
two other `click` events are being triggered. 
This is a known issue of DOM events and there are multiple solutions to it.
Here's one solution, specifically for D3: 
[Distinguishing click and double-click in D3](http://bl.ocks.org/couchand/6394506).

**Continue** to [Adding a default configuration](step6-default-configuration).
