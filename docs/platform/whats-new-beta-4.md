---
title: What's new and changed in the Platform JavaScript APIs beta 4
description: Describes the new and changed features in the beta 4 of the Platform JavaScript APIs.
layout: default
---

## Platform JavaScript APIs

### Modules API{{site.starNew}}

The new _Modules API_ brings easy access to functionalities such as _configuration_ and _inversion of control_ 
to any AMD module.
You can check the reference documentation at  
[pentaho.module]({{site.refDocsUrlPattern | replace: '$', 'pentaho.module'}})

The Modules API levels the ground between regular AMD modules and 
those that export [Type API]({{site.refDocsUrlPattern | replace: '$', 'pentaho.type'}}) types,
by removing the magic by which configurations were automatically applied to the latter, 
via its old custom module format.
All AMD modules now consume configurations explicitly via the Modules API 
(or, alternatively, explicitly via the global configuration service module, 
 [pentaho/config/service]({{site.refDocsUrlPattern | replace: '$', 'pentaho.config.service'}})).
 
1. An AMD module will now typically request its _Modules API_ module object
   by using the 
   [pentaho/module!]({{site.refDocsUrlPattern | replace: '$', 'pentaho.module' | append: '#.metaOf'}}) AMD loader plugin,
   like in the following example:

    ```js
    // Obtain the "self" module.
    define(["pentaho/module!_"], function(module) {
    
      if(module.config) {
        // Do something with the module's configuration object.
      }
    });
    ```

2. The way in which *inversion of control* is performed has changed, 
   and now it solely circles around the _module_ concept.
   Instead of advertising _type_ and _instance_ modules separately, 
   via AMD configuration of the old `pentaho/instanceInfo` and `pentaho/typeInfo` modules,
   both of these kinds of modules are now advertised by configuring the single `pentaho/modules` module, 
   such as in the following example:

    ```js
    require.config({
      config: {
        "pentaho/modules": {
          // An interface is an abstract type.
          "IHomeScreen": {base: null, isAbstract: true},
          
          // An module which returns an instance of `IHomeScreen`.
          "mine/homeScreen": {type: "IHomeScreen"},
          
          // Another instance of `IHomeScreen`, yet with a higher ranking.
          "yours/proHomeScreen": {type: "IHomeScreen", ranking: 2}
        }
      }
    });
    ```

3. Obtaining the registered instance modules of a given module type, 
   or the registered type modules descending from a given base type, 
   is now done through the one of the following new AMD loader plugin modules, 
   effectively replacing and extending the old `pentaho/service` module:

   * [pentaho/module/instanceOf!]({{site.refDocsUrlPattern | replace: '$', 'pentaho.module' | append: '#.instanceOf'}})
   * [pentaho/module/instancesOf!]({{site.refDocsUrlPattern | replace: '$', 'pentaho.module' | append: '#.instancesOf'}})
   * [pentaho/module/typeOf!]({{site.refDocsUrlPattern | replace: '$', 'pentaho.module' | append: '#.typeOf'}})
   * [pentaho/module/typesOf!]({{site.refDocsUrlPattern | replace: '$', 'pentaho.module' | append: '#.typesOf'}})

   The following example illustrates the use of `pentaho/module/instanceOf` to obtain a 
   registered instance of the `IHomeScreen` interface:

    ```js
    define(["pentaho/module/instanceOf!IHomeScreen"], function(homeScreen) {
      // Use `homeScreen`.
    });
    ```

### Configuration API

1. Configuration rules no longer distinguish if a `type` or an `instance` module is being configured.
  These must now use the new 
  [module]({{site.refDocsUrlPattern | replace: '$', 'pentaho.config.spec.IRule#module'}})
  property, indistinguishably.

2. Configuration rules have become more powerful as now these can specify dependency modules, 
   through the [deps]({{site.refDocsUrlPattern | replace: '$', 'pentaho.config.spec.IRule#deps'}}){{site.starNew}} 
   property.
   Configurations can now also be built dynamically, 
   by _specifying a function_{{site.starNew}} in 
   the [apply]({{site.refDocsUrlPattern | replace: '$', 'pentaho.config.spec.IRule#apply'}}) property.

   The following example illustrates the use of the new features, 
   in a configuration rule that changes the default color palette used by the stock bar chart visualization:

   ```js
   var configRule = {
     select: {
       module: "pentaho/visual/models/Bar"
     },
     deps: [
       "pentaho/visual/color/palettes/nominalLight"
     ],
     apply: function(nominalLightPalette) {
       return {
         props: {
           palette: {
             defaultValue: nominalLightPalette
           }
         }
       };
     }
   };
   ```

3. Configuration rules can now reference modules (or dependencies) with a module id
   relative to the rule set configuration file.
    
4. When registering configuration rules with the modules system, 
   you should now use the identifier: `pentaho/config/spec/IRuleSet`.
   For example:

   ```js
   require.config({
     config: {
       "pentaho/modules": {
         "my/viz/config": {type: "pentaho/config/spec/IRuleSet"}
       }
     }
   });
   ```

### Type API

The use of _Type API_ types and instances has been greatly simplified. 

1. Types and instances are no longer defined using a special module format.
   Now, they're defined just like any regular class or instance would be defined in an AMD module.

   The following example shows how it now looks like to define a visualization model type 
   (which is a _Type API_ type): 

    ```js
    define([
      "pentaho/module!_",
      "pentaho/visual/base/Model"
    ], function(module, BaseModel) {
      
      return BaseModel.extend({
        $type: {
          id: module.id,
          defaultView: "./View",
          props: [
            {
              name: "category",
              base: "pentaho/visual/role/Property",
              modes: ["string"],
              fields: {isRequired: true}
            }
          ]
        }
      })
      .configure({$type: module.config});
    });
    ```

2. It is now each type's responsibility to apply its own configuration.
   It is nonetheless advisable to use the new 
   [configure]({{site.refDocsUrlPattern | replace: '$', 'pentaho.type.Type#configure'}}) method. 
 
3. The identifiers of all standard type modules have been renamed to using _CamelCase_,
   to match the exported value kind, a type.

4. The old Type API `Context` is gone!
   For the rare cases in which you'll need to create 
   Type API types given a type reference, 
   or instances given their specification, 
   you can use the new 
   [pentaho.type.loader]({{site.refDocsUrlPattern | replace: '$', 'pentaho.type.loader'}}) service. 

### Visualization API

See [What's new and changed in the Visualization API beta 4]({{ "/platform/visual/whats-new-beta-4" | relative_url }}).
