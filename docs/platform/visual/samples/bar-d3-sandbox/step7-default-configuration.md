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

For example, if by the time that a visualization, `V1` is developed, the application `A1` is super-popular,
and has a custom feature that is not part of the standard container application interface,
the developer of `V1` may package it a configuration module so that it better integrates with `A1`, 
out-of-the-box.

If you do not have any knowledge about JavaScript configuration in the Pentaho Platform, 
you might want to read [Configuring a visualization](../../configuration) before continuing.

## Create the configuration module

Now, create a configuration file, called `config.js`, and place the following content in it:

```js
define(["module"], function(module) {
  // Replace /config by /model.
  // e.g. "pentaho-visual-samples-bar-d3/model".
  var vizId = module.id.replace(/(\w+)$/, "model");

  return {
    rules: [
      // Sample rule
      {
        priority: -1,
        select: {
          type: vizId
        },
        apply: {
          props: {
            barSize: { defaultValue: 50 }
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
For such, edit the `package.json` file and add a [`pentaho/instanceInfo`]({{site.refDocsUrlPattern | replace: '$', 'pentaho.instanceInfo'}})
configuration so that your file looks like this:

```json
{
  "name": "pentaho-visual-samples-bar-d3",
  "version": "0.0.1",

  "config": {
    "pentaho/typeInfo": {
      "pentaho-visual-samples-bar-d3/model": {
        "base": "pentaho/visual/base/model"
      }
    },
    "pentaho/instanceInfo": {
      "pentaho-visual-samples-bar-d3/config": {
        "type": "pentaho.config.spec.IRuleSet"
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

Note the modified `config` property.

Now, refresh the `sandbox.html` page in the browser, and you should see a Bar chart with wider bars.
Go ahead and experiment with different values.

## Analyzer Integration

In [Analyzer](http://www.pentaho.com/product/business-visualization-analytics), 
when drilling-down, the default behaviour is to _add_ the child attribute to the visual role 
where the parent attribute is.
However, the _Category_ visual role of the Bar visualization you developed only accepts a single attribute 
being mapped to it. This results in Analyzer not allowing to drill-down.

However, it is possible to configure the Analyzer-specific metadata property, 
`application.keepLevelOnDrilldown` to force replacing the
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
but is important if you package your visualization for deployment.

**Continue** to [Next steps](stepNext).
