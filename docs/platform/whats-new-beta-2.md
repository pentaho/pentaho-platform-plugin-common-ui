---
title: What's new and changed in the Platform JavaScript APIs beta 2
description: Describes the new and changed features in the beta 2 of the Platform JavaScript APIs.
layout: default
---

## Platform JavaScript APIs

### Global changes

1. All class members documented as private are now consistently named, by having a `__` prefix.
   Likewise, all protected class members now have a `_` prefix.


### Core APIs

1. The `pentaho/context` module has been renamed to 
   [pentaho/environment]({{site.refDocsUrlPattern | replace: '$', 'pentaho.environment'}}).

2. Services are no longer registered with 
   [pentaho/service]({{site.refDocsUrlPattern | replace: '$', 'pentaho.service'}}) but instead with
   one of the [pentaho/instanceInfo]({{site.refDocsUrlPattern | replace: '$', 'pentaho.instanceInfo'}}){{site.starNew}} or 
   [pentaho/typeInfo]({{site.refDocsUrlPattern | replace: '$', 'pentaho.typeInfo'}}){{site.starNew}} modules,
   depending on whether the registered module provides an _instance_ or a _type_, respectively.
   `pentaho/service` is still used as an AMD loader plugin to obtain registered instances of a given type.


### Data API

1. Filter types have moved from `pentaho/type/filter` to 
   [pentaho/data/filter]({{site.refDocsUrlPattern | replace: '$', 'pentaho.data.filter'}}).

2. New property filter types
   (e.g. [pentaho/data/filter/isLess]({{site.refDocsUrlPattern | replace: '$', 'pentaho.data.filter.IsLess'}})).{{site.starNew}}


### Type API

1. Some class members were _renamed_ to improve readability and/or reduce clashing likelihood:

    1. The `type` property used when defining a type or for accessing the type object of an instance
       was renamed to [$type]({{site.refDocsUrlPattern | replace: '$', 'pentaho.type.Instance#$type'}});
       other instance-side system properties were also renamed to contain a `$` prefix
       (e.g. [$isValid]({{site.refDocsUrlPattern | replace: '$', 'pentaho.type.Complex#$isValid'}})).
    
    2. The attribute `value` of complex properties was renamed to 
       [defaultValue]({{site.refDocsUrlPattern | replace: '$', 'pentaho.type.Property.Type#defaultValue'}}).
       
    3. The attribute `type` of complex properties was renamed to
       [valueType]({{site.refDocsUrlPattern | replace: '$', 'pentaho.type.Property.Type#valueType'}}).
   
2. The format of type modules has changed.
   Dependencies on other Type API types are not declared as AMD dependencies anymore, in the `define` call,
   but are instead declared in an array which is returned, together with the type factory function
   (see [UTypeModule]({{site.refDocsUrlPattern | replace: '$', 'pentaho.type.spec' | append: '#.UTypeModule'}})):
   
   ```js
   define(["module"], function(module) {
  
     return ["complex", function(Complex) {
    
       return Complex.extend({
         $type: {
           id: module.id
         }      
       });
     }];
   });
   ```
   
3. It is now possible to apply [mixins]({{site.refDocsUrlPattern | replace: '$', 'pentaho.type.Type#mixins'}})
   to Type API types, through configuration.{{site.starNew}}
   
   This is to avoid generating configuration files having functions, possibly with AMD dependencies on other modules. 
   Any non-trivial code can be moved to a separate module which is only loaded
   if and when the target type is actually used. This also makes it easier to test configuration code.

4. The Type API now supports _instance modules_.{{site.starNew}}

   Instance modules are _instances_ dual of _type modules_.
   Just like types, instances also support configuration.
   The following illustrates a color palette instance:
   
   ```js
   define(["pentaho/util/spec"], function(specUtil) {
   
     "use strict";
   
     return ["pentaho/visual/color/palette", function(Palette, config) {
   
       var spec = specUtil.merge({
         level: "divergent",
         colors: ["#FF0000", "#FFFF00", "#4BB6E4"]
       }, config);
   
       return new Palette(spec);
     }];
   });
   ```

5. The [defaultValue]({{site.refDocsUrlPattern | replace: '$', 'pentaho.type.Property.Type#defaultValue'}}) 
   attribute of a complex type property can now be a function.{{site.starNew}}
   
   The function is evaluated when the complex is constructed and whenever the property is set to `null`.
   Due to this, default values of properties having a `valueType` of `function` 
   now need to wrap the value in an auxiliary function.

6. The semantics of the
   [defaultValue]({{site.refDocsUrlPattern | replace: '$', 'pentaho.type.Property.Type#defaultValue'}}) 
   attribute of a complex type property has changed.
   A value is now considered specified when explicitly set by the user,
   even if set to the default value. This mostly affects serialization. 

7. It is no longer possible to set the 
   [valueType]({{site.refDocsUrlPattern | replace: '$', 'pentaho.type.Property.Type#valueType'}})
   attribute of a property through configuration, as this, in general, was not a type-safe operation.
   This pattern was used when defining enumerations (by using refinement types),
   or when defining Visualization API visual roles.
   Both of these are now defined in other ways.

8. Enumerations are now easier to declare (_refinement types_ no more!).
   Now, defining an enumeration type leverages mixins and has become as simple as:
   
   ```js
   define(function() {
   
     return ["string", function(PentahoString) {
   
       return PentahoString.extend({
         $type: {
           mixins: ["enum"],
           domain: ["A", "B", "C", "D"]
         }
       });
     }];
   });
   ```
   
   If the value domain of a property is dynamic, 
   the [domain]({{site.refDocsUrlPattern | replace: '$', 'pentaho.type.Property.Type#domain'}})
   attribute can be used to dynamically filter the domain of an enumeration type.
   
9. Load tolerance to failure of individual types.{{site.starNew}}
 
   When all of the subtypes of a given base type are requested and loaded, 
   and one of the subtypes fails to load, the whole operation still succeeds.
   This happens, for example, when loading all registered Visualization API models,
   to display in the menu of an application.


### Visualization API

See [What's new and changed in the Visualization API beta 2]({{ "/platform/visual/whats-new-beta-2" | relative_url }}).


## Pentaho Web Platform

### Pentaho Web Package deployer{{site.starNew}}

The Pentaho Web Package deployer allows to easily deploy web resources in the Pentaho Platform,
without the need to build a OSGi bundle JAR file.

Previously you needed to setup a Maven project, deal with assemblies, KAR files, etc. With Pentaho 8.0
you can simply create an archive with your files and directly deploy it. Check [OSGi Artifacts Deployment]({{ "/platform/osgi-deployment" | relative_url }})
for more information.
