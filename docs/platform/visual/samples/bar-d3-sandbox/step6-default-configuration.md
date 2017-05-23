---
title: Step 6 - Adding a default configuration
description: Walks you through adding a default configuration to the visualization.
parent-path: .
parent-title: Develop a custom Bar chart visualization using D3
layout: default
---

While all visualization container applications should be able to use any visualization, 
without them knowing each other, 
it is also true that one or the other can be provided with configurations
that somehow improve their integration.

For example, if by the time that a visualization, `V1` is developed, the application `A1` is super-popular,
and has a custom feature that is not part of the standard container application interface,
the developer of `V1` may package it a configuration module so that it better integrates with `A1`, 
out-of-the-box.

If you do not have any knowledge about JavaScript configuration in the Pentaho Platform, 
you might want to read 
[Configuring a visualization](../../configuration) before continuing.

## Create the configuration module

Now, create a configuration file, called `config.js`, and place the following content in it:

```js
define(["module"], function(module) {
  
  // Replace /config by /model.
  // e.g. "pentaho/visual/samples/bar/model".
  var vizId = module.id.replace(/(\w+)$/, "model");
  
  return {
    rules: [
      {
        priority: -1,
        select: {
          type: vizId
        },
        apply: {
          props: {
            barSize: {value: 50}
          }
        }
      }
    ]
  };
});
```

This configuration applies to the Bar visualization model type, in any application, 
has a lower-than-default-priority, and 
simply changes the default value of the `barSize` property to `50` pixels.
For now, this only serves for us to prove that configuration actually works. 
We'll use the Sandbox environment to make sure.

## Register the configuration module in the sandbox

It is still necessary to register the configuration module with the configuration system.
For such, edit the `index.html` file and replace the script tag where the AMD/RequireJS system is configured
with the following:

```html
  <script>
    // Needed only in a sandbox environment.
    require.config({
      paths: {
        "pentaho/visual/samples/bar": ".",
        "d3": "./node_modules/d3/build/d3"
      },
      config: {
        "pentaho/service": {
          "pentaho/visual/samples/bar/config": "pentaho.config.spec.IRuleSet"
        }
      }
    });
  </script>
```

Note the added `config` property.

Now, refresh the `index.html` page in the browser, and you should see a Bar chart with wider bars.
Go ahead and experiment with different values.

## PDI Integration

Currently, the [PDI](http://www.pentaho.com/product/data-integration) application
requires visualizations to come annotated with which "data views", _Stream_ and/or _Model_, they can be used with.
This is a current limitation that will be removed in future releases. 
However, until then, the Bar visualization can be configured to contain this required metadata when
being used by the PDI application. Add the following rule to the `config.js` file:

```js
define(["module"], function(module) {
  // ...
  return {
    rules: [
      // ..,
      {
        priority: -1,
        select: {
          type: vizId,
          application: "pentaho-det"
        },
        apply: {
          supportedModes: ["STREAM", "MODEL"]
        }
      }
    ]
  };
});
```

Note that this rule has no effect when testing your visualization in the sandbox environment, 
but is important if you package and bundle your visualization for deployment. 

## Analyzer Integration

In [Analyzer](http://www.pentaho.com/product/business-visualization-analytics), 
when drilling-down, the default behaviour is to _add_ the child attribute to the visual role 
where the parent attribute is.
However, the _Category_ visual role of the Bar visualization you developed only accepts a single attribute 
being mapped to it. This results in that, when drilling-down, Analzyer leads the visualization into an invalid
state, forcing the user the remove the parent attribute by hand.

While this behaviour will probably be fixed in a future version, until then, 
the Analyzer-specific metadata property, `application.keepLevelOnDrilldown` can be used to force replacing the
parent attribute with the child attribute when drilling-down.
Add the following rule to the `config.js` file:

```js
define(["module"], function(module) {
  // ...
  return {
    rules: [
      // ..,
      {
        priority: -1,
        select: {
          type: vizId,
          application: "pentaho-analyzer"
        },
        apply: {
          application: {
            keepLevelOnDrilldown: false
          }
        }
      }
    ]
  };
});
```

Again, note that this rule has no effect when testing your visualization in the sandbox environment, 
but is important if you package and bundle your visualization for deployment.

**Continue** to [Next steps](stepNext).
