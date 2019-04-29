---
title: What's new and changed in the Visualization API beta 4
description: Describes the new and changed features in the beta 4 of the Visualization API.
parent-title: Visualization API
layout: default
---

You might want to take a look at 
[What's new and changed in the Platform JavaScript APIs beta 4](../whats-new-beta-4). 

## Procedure for converting a visualization from beta 3 to beta 4

### Convert the Model class

1. Convert the file name to camel case.
2. Add the `pentaho/module!_` dependency to the AMD module.
3. Move _Type API_ dependencies to dependencies of the AMD module,
   converting all type modules to camel case.
   Includes, at a minimum, the base model type dependency.
4. Specify the `id` type property using `module.id`.
5. Convert the `defaultView` type property to reference 
   the new camel case view identifier.
6. Convert any other references to _Type API_ types to camel case, 
   for example, in visual role properties, 
   convert their `base` attribute to `pentaho/visual/role/Property`.
7. Apply the module configuration to the type.

**Before Example**
```js
// File .../model.js
define(["module"], function(module) {
  
  return ["pentaho/visual/base/model", function(BaseModel) {
    
    return BaseModel.extend({
      $type: {
        id: module.id,
        defaultView: "./view",
        props: [
          // Visual role property
          {
            name: "category",
            base: "pentaho/visual/role/property",
            fields: {isRequired: true}
          },
            
          // Palette property
          {
            name: "palette",
            base: "pentaho/visual/color/paletteProperty",
            levels: "nominal",
            isRequired: true
          }
        ]
      }
    });
  }];
});
```

**After Example**
```js
// File .../Model.js
define([
  "pentaho/module!_",
  "pentaho/visual/base/Model"
], function(module, BaseModel) {
  
  return BaseModel.extend({
    $type: {
      id: module.id,
      defaultView: "./View",
      props: [
        // Visual role property
        {
          name: "category",
          base: "pentaho/visual/role/Property",
          fields: {isRequired: true}
        },
        
        // Palette property
        {
          name: "palette",
          base: "pentaho/visual/color/PaletteProperty",
          levels: "nominal",
          isRequired: true
        }
      ]
    }
  })
  .configure({$type: module.config});
});
```

### Convert the View class

1. Convert the file name to camel case.
2. Add the `pentaho/module!_` dependency to the AMD module.
3. Move _Type API_ dependencies to dependencies of the AMD module,
   converting all type modules to camel case.
   Includes, at a minimum, the base view type and the associated model dependencies.
4. Specify the `id` type property using `module.id`.
5. Convert any other references to _Type API_ types to camel case, 
   for example, the identifiers of select or execute actions,
   or of filters. For example:
   * `pentaho/visual/action/Select`
   * `pentaho/visual/action/Execute`
   * `pentaho/data/filter/And`.
6. Apply the module configuration to the type.

**Before Example**
```js
// File .../view.js
define(["module"], function(module) {
  
  return [
    "pentaho/visual/base/view", 
    "./model",
    "pentaho/visual/action/execute",
    "pentaho/visual/action/select",
    "pentaho/data/filter/and",
    function(BaseView, Model, ExecuteAction, SelectAction, AndFilter) {
    
    return BaseView.extend({
      $type: {
        id: module.id,
        props: [
          {
            name: "model",
            valueType: Model
          }
        ]
      },
      // ...
    });
  }];
});
```

**After Example**
```js
// File .../View.js
define([
  "pentaho/module!_",
  "pentaho/visual/base/View",
  "./Model",
  "pentaho/visual/action/Execute",
  "pentaho/visual/action/Select",
  "pentaho/data/filter/And" 
], function(module, BaseView, Model, ExecuteAction, SelectAction, AndFilter) {
  
  return BaseView.extend({
    $type: {
      id: module.id,
      props: [
        {
          name: "model",
          valueType: Model
        }
      ]
    },
    // ...
  })
  .configure({$type: module.config});
});
```

### Convert Registrations in the Package Definition

1. Merge the `pentaho/typeInfo` and `pentaho/instanceInfo` sections into a 
   single `pentaho/modules` section.
2. Rename the advertised model type to upper case, as long as its base type.
3. Change rule set configuration modules to be of the type `pentaho/config/spec/IRuleSet`.

**Before Example**:
```json
{
  "name": "my-viz",
  "version": "1.0.0",
  "config": {
    "pentaho/typeInfo": {
      "my-viz/model": {
        "base": "pentaho/visual/base/model"
      }
    },
    "pentaho/instanceInfo": {
      "my-viz/config": {
        "type": "pentaho.config.spec.IRuleSet"
      }
    }
  }
}
```

**After Example**:
```json
{
  "name": "my-viz",
  "version": "2.0.0",
  "config": {
    "pentaho/modules": {
      "my-viz/Model": {
        "base": "pentaho/visual/base/Model"
      },
      "my-viz/config": {
        "type": "pentaho/config/spec/IRuleSet"
      }
    }
  }
}
```

### Convert Configuration Rules

1. Rename the `type` and `instance` properties to `module`.
2. Move AMD module dependencies of a rule set module,
   that are specific to certain rules, 
   to dependencies of the rules themselves.
3. Prefer the use of relative module ids in the `module` or `deps` properties.

**Before Example**:
```js
define(["module"], function(module) {
  // Replace /config by /model (e.g. "my-viz/model").
  var vizId = module.id.replace(/(\w+)$/, "model");

  return {
    rules: [
      {
        select: {
          type: vizId
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

**After Example**:
```js
define(function() {
  return {
    rules: [
      {
        select: {
          // Assuming the config file is beside the Model file.
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

### Convert the sandbox

It's best to just get the new sandbox code and to paste in the specifics of your visualization again,
as described in 
[Bar/D3 Visualization in Sandbox, Step 1 - Preparing the environment](./samples/bar-d3-sandbox/step1-environment-preparation).
