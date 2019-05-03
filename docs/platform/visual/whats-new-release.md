---
title: What's new and changed in the Visualization API release
description: Describes the new and changed features in the release version of the Visualization API, relative to the beta 4 version.
parent-title: Visualization API
layout: default
---

You might want to take a look at 
[What's new and changed in the Platform JavaScript APIs release](../whats-new-release). 

## Procedure for converting a visualization from beta 4 to release

### Convert the Model class

1. Change the identifier `pentaho/visual/base/Model` to `pentaho/visual/Model`.
2. Remove the `defaultView` attribute (but remember what it contained).
3. Remove the `{$type: module.config}` argument of the `configure` method call;
   this is now the default behavior.

**Before Example**
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

**After Example**
```js
// File .../Model.js
define([
  "pentaho/module!_",
  "pentaho/visual/Model"
], function(module, BaseModel) {
  
  return BaseModel.extend({
    $type: {
      id: module.id,
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
  .configure();
});
```

### Change the model registration

In the associated `package.json` file, 
change the identifier `pentaho/visual/base/Model` to `pentaho/visual/Model`.

### Register the default view

In the associated `package.json` file, 
add a 
[pentaho/visual/DefaultViewAnnotation]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.DefaultViewAnnotation'}}) 
module annotation to the visualization model's module, 
referencing the value which was previously on the `defaultView` attribute
(the `"..."` properties stand for omitted content):

```json
{
  "...": "...",
  
  "config": {
    "pentaho/modules": {
      
      "...": "...",
      
      "my/viz/Model": {
        "base": "pentaho/visual/Model",
        "annotations": {
        
          "...": "...",
          
          "pentaho/visual/DefaultView": {
            "module": "./View"
          },
          
          "...": "..."
        }
      },
      
      "...": "..."
    }
  },
  
  "...": "...",
}
```

### Convert the View class

The view class no longer has a required base class — it simply needs to implement the
[pentaho/visual/IView]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.IView'}})
interface. 
Nonetheless, an optional base class is provided,
[pentaho/visual/impl/View]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.impl.View'}}),
which implements basic functionality and is mostly compatible with the previous `pentaho.visual.base.View` base class.

One consequence of this is that view classes no longer need to be Type API types.
If a view is configurable, it must now implement its configuration logic by reading and applying `module.config`.

1. Remove the dependency on the associated model class.
2. Replace the dependency on `pentaho/visual/base/View` by a dependency to `pentaho/visual/impl/View`. 
3. Should no longer need to explicitly depend on the `pentaho/visual/action/Execute` and 
   `pentaho/visual/action/Select` as the new model methods 
   [Model#execute]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.Model' | append: '#execute'}}) 
   and 
   [Model#select]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.Model' | append: '#select'}})
   can be conveniently used; 
   direct calls to the  
   [Model#act]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.Model' | append: '#act'}}) method
   can be replaced by these higher-level ones;
   also, notice how these are now methods of the model and not of the view.
4. Replace references to `this.width` and `this.height` to `this.model.width` and `this.model.height`, respectively;
   these two properties have moved to the model class.
5. Move any code in the now removed `_initDomContainer` method to the constructor.
6. Move any code in the now removed `_releaseDomContainer` method to the `dispose` method.

**Before Example**
```js
// File .../View.js
define([
  "pentaho/module!_",
  "pentaho/visual/base/View",
  "./Model",
  "pentaho/visual/action/Execute",
  "pentaho/visual/action/Select"
], function(module, BaseView, Model, ExecuteAction, SelectAction) {
  
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
    
    _initDomContainer: function() {
      
      // Code to initialize this.domContainer.
      
    },
    
    _updateAll: function() {
      
      var width = this.width;
      var height = this.height;
      
      // ...
      
      this.act(new ExecuteAction({dataFilter: dataFilter}));
      
      // ...
      
      this.act(new SelectAction({dataFilter: dataFilter}));
    },
    
    _releaseDomContainer: function() {
      
      // Code to release this.domContainer.
      
    }
    
    // ...
  })
  .configure({$type: module.config});
});
```

**After Example**
```js
// File .../View.js
define([
  "pentaho/module!_",
  "pentaho/visual/impl/View"
], function(module, BaseView) {
  
  return BaseView.extend(module.id, {
    
    constructor: function(viewSpec) {
      
      this.base(viewSpec);
      
      // Code to initialize this.domContainer.
      
    },
    
    // ...
    
    
    _updateAll: function() {
       
      // ...
       
      var width = this.model.width;
      var height = this.model.height;
             
      // ...
      
      this.model.execute({dataFilter: dataFilter});
      
      // ...
      
      this.model.select({dataFilter: dataFilter});
    },
    
    // ...
    
    dispose: function() {
      
      if(this.domContainer !== null) {
        
        // Code to release this.domContainer.
                
      }
      
      this.base();
    }
  });
});
```

### Convert Configuration Rules

1. Rename the identifiers of applications used in the `application` selector attribute of any rules;
   use [this correspondence table](../whats-new-release#application-identifiers-changed).

**Before Example**:
```js
define({
  rules: [
    {
      select: {
        module: "./Model",
        application: "pentaho-analyzer"
      },
      apply: {
        props: {
          barSize: {defaultValue: 50}
        }
      }
    }
  ]
});
```

**After Example**:
```js
define({
  rules: [
    {
      select: {
        module: "./Model",
        application: "pentaho/analyzer"
      },
      apply: {
        props: {
          barSize: {defaultValue: 50}
        }
      }
    }
  ]
});
```

### Convert the sandbox

It's best to just get the new sandbox code and to paste in the specifics of your visualization again,
as described in 
[Bar/D3 Visualization in Sandbox, Step 1 - Preparing the environment](./samples/bar-d3-sandbox/step1-environment-preparation).
