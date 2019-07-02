---
title: Step 7 - Adding a default configuration
description: Walks you through adding a default configuration to the visualization.
parent-path: .
parent-title: Bar/D3 Visualization in Sandbox
grand-parent-title: Create a Custom Visualization
grand-parent-path: ../../create
grand-grand-parent-title: Visualization API
grand-grand-parent-path: ../..
layout: default
---

While all visualization container applications should be able to use any visualization, 
without them knowing each other, 
it is also true that one or the other can be provided with configurations
that somehow improve their integration.

For example, 
if, by the time that a visualization, `V1`, is developed, 
an application, `A1`, is super-popular and has a custom feature that is not part of 
the standard container application interface,
the developer of `V1` may package with it a configuration module so that it better integrates with `A1`, 
out-of-the-box.

If you do not have any knowledge about JavaScript configuration in the Pentaho Platform, 
you might want to read [Configuring a visualization](../../configuration) before continuing.

## Create the configuration module

Now, create a configuration file, called `config.js`, and place the following content in it:

```js
define(function() {
  
  "use strict";
  
  return {
    rules: [
      // Sample rule
      {
        priority: -1,
        select: {
          module: "./Model"
        },
        apply: {
          props: {
            barSize: {defaultValue: 50}
          }
        }
      }
    ]
  };
});
```

This configuration applies to the Bar visualization model type, in any application, 
has a lower-than-default-priority, and 
changes the default value of the `barSize` property to `50` pixels.
For now, this only serves for us to prove that configuration actually works. 
We'll use the sandbox environment to make sure.

## Register the configuration module

It is still necessary to register the configuration module with the configuration system.
In the `package.json` file, declare the `pentaho/visual/samples/barD3/config` module as a ruleset module: 

```json
{
  "name": "@pentaho/visual-samples-bar-d3",
  
  "...": "...",
  
  "config": {
    "pentaho/modules": {
    
      "...": "...",
      
      "pentaho/visual/samples/barD3/config": {
        "type": "pentaho/config/spec/IRuleSet"
      }
    }
  },

  "...": "..."
}
```

Now, refresh the `sandbox.html` page in the browser, and you should see a bar chart with wider bars.

## Analyzer Integration

In 
[Analyzer](https://www.hitachivantara.com/en-us/products/big-data-integration-analytics/pentaho-business-analytics.html), 
when drilling-down, 
the default behaviour is to _add_ the child field to the visual role after 
where the parent field is.
However, the _Category_ visual role of the Bar visualization you developed only accepts a single field 
being mapped to it. This results in Analyzer not allowing to drill-down.

However, 
it is possible to configure the Analyzer-specific metadata property, `keepLevelOnDrilldown`, 
to force replacing the parent field with the child field, when drilling-down.
To specify this configuration property, 
add a `pentaho/analyzer/visual/OptionsAnnotation` annotation to the visualization model,
via a configuration rule:

```js
// config
define(function() {
  
  // ...
  
  return {
    rules: [
      
      // ...
      
      {
        priority: -1,
        select: {
          module: "./Model",
          annotation: "pentaho/analyzer/visual/Options",
          application: "pentaho/analyzer"
        },
        apply: {
          keepLevelOnDrilldown: false
        }
      }
    ]
  };
});
```

Again, note that this rule has no effect when testing your visualization in the sandbox environment, 
but is important if you package your visualization for deployment.

**Continue** to [Next steps](stepNext).
