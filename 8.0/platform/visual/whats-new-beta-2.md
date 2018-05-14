---
title: What's new and changed in the Visualization API beta 2
description: Describes the new and changed features in the beta 2 of the Visualization API.
parent-title: Visualization API
layout: 8.0_default
---

Be sure to also read [What's new and changed in the Platform JavaScript APIs beta 2](../whats-new-beta-2). 

## New and changed features

### Color Palettes{{site.starNew}}

The Visualization API beta 1 did not offer visualizations a serious and standard way to 
represent the color palettes of color scales. 
It did provide a singleton `PaletteRegistry` service — 
a temporary, poor alternative to having a global array of color arrays.
This service did not offer any easy means for registration of custom color palettes, 
or for configuring existing ones.
Additionally, visualizations' views were expected to know and reach to this registry for obtaining appropriate color palettes.

Color palettes are now a first class object of the Visualization API:
[pentaho/visual/color/palette]({{site.refDocsUrlPattern8 | replace: '$', 'pentaho.visual.color.Palette'}}).
Depending on their intended use, 
color palettes are classified to be of one the following [level]({{site.refDocsUrlPattern8 | replace: '$', 'pentaho.visual.color.Palette#level'}})s:

1. `nominal`

    <img src="img/nominal2.png" alt="Nominal Color Palette" style="width: 300px;">

2. `quantitative`

    <img src="img/quantitativeBlue.png" alt="Quantitative Color Palette" style="width: 300px;">
    
3. `divergent`

    <img src="img/divergent1.png" alt="Divergent Color Scale" style="width: 300px;">

Visualization models can now declare properties of the special `base` property type 
[pentaho/visual/color/paletteProperty]({{site.refDocsUrlPattern8 | replace: '$', 'pentaho.visual.color.PaletteProperty'}}),
which declare the acceptable 
color palette [levels]({{site.refDocsUrlPattern8 | replace: '$', 'pentaho.visual.color.PaletteProperty.Type#levels'}}).

```js
BaseModel.extend({
 $type: {
   props: [
     {
       name: "palette",
       base: "pentaho/visual/color/paletteProperty",
       levels: ["nominal"]
     }
   ]
 }
});
```

The value of properties of this type is _defaulted_ to the highest rank system color palette that 
matches the levels required by the property.
The provided stock color palettes can be configured and also custom color palettes can be registered.


### The id of the base visual model changed
 
To conform to the new naming rules of types,
with respect to the equivalence between the module id and the provided type id, 
we changed the module id of the base visual model to: `pentaho/visual/base/model`.
This now matches the id of the type: 
[pentaho.visual.base.Model]({{site.refDocsUrlPattern8 | replace: '$', 'pentaho.visual.base.Model'}}).

This will impact your model types, if they extend directly from the base model.
Also, this will impact the registration of visualizations as services. 
See [Procedure for converting a visualization from beta 1 to beta 2](#procedure-for-converting-a-visualization-from-beta-1-to-beta-2), 
for more information.

### New syntax for declaring a visual role property

The old syntax for declaring a visual role property 
required overriding the inherited `valueType` of the property and 
then, if you wanted to change the number of attributes accepted by the visual role,
you had to change the nested `attributes` property.
While the old syntax was not the friendliest, 
it was the fact that it proved not to be a type safe operation to 
override the `valueType` of a property through configuration 
that forced us to change the old syntax.

The *new syntax* results in a mostly flat visual role property declaration.

In the following example, an ordinal visual role is declared
which accepts one or two attributes of type `string`:

```js
BaseModel.extend({
 $type: {
   props: [
     {
       name: "category",
       base: "pentaho/visual/role/property",
       levels: ["ordinal"],
       dataType: "string",
       attributes: {
         countMin: 1,
         countMax: 2
       }
     }
   ]
 }
});
```

The `base` property type of [pentaho/visual/role/property]({{site.refDocsUrlPattern8 | replace: '$', 'pentaho.visual.role.Property'}})
is always used, and it is the [levels]({{site.refDocsUrlPattern8 | replace: '$', 'pentaho.visual.role.Property.Type#levels'}}) attribute 
which is set to specify the measurement levels supported by the visual role.

## Procedure for converting a visualization from beta 1 to beta 2

The following procedure outlines the changes required to upgrade a 
common visualization written for beta 1.

### Convert the `package.json` file
   
Change `pentaho/service` registrations to `pentaho/typeInfo` or `pentaho/instanceInfo` registrations.
Note the use of the new visual base model identifier.

Also, you no longer need to use the complete final module identifier 
(<code>"pentaho-visual-samples-bar-d3_0.0.1"</code>).

**Before**

```json
{ 
  "name": "pentaho-visual-samples-bar-d3",
  "version": "0.0.1",
  "config": {
    "pentaho/service": {
      "pentaho-visual-samples-bar-d3_0.0.1/model": "pentaho/visual/base",
      "pentaho-visual-samples-bar-d3_0.0.1/config": "pentaho.config.spec.IRuleSet"
    }
  }
}
```

**After**

```json
{ 
  "name": "pentaho-visual-samples-bar-d3",
  "version": "0.0.1",
  "config": {
    "pentaho/typeInfo": {
      "pentaho-visual-samples-bar-d3/model": {"base": "pentaho/visual/base/model"}
    },
    "pentaho/instanceInfo": {
      "pentaho-visual-samples-bar-d3/config": {"type": "pentaho.config.spec.IRuleSet"}
    }
  }
}
```

### Convert the model

The following changes need to be made:
1. Use the new type module format.
2. Rename the top-level `type` to `$type`.
3. Rename the properties' attribute `type` to `valueType`.
4. Rename the properties' attribute `value` to `defaultValue`.
5. Use the new visual base model identifier.

**Before**

```js
define([
  "module",
  "pentaho/visual/base"
], function(module, baseModelFactory) {
  
  "use strict";
  
  return function(context) {
    
    var BaseModel = context.get(baseModelFactory);
    
    var BarModel = BaseModel.extend({
      type: {
        id: module.id,
        props: [
          {
            name: "barSize",
            type: "number",
            value: 30,
            isRequired: true
          },
          {
            name: "category",
            type: {
              base: "pentaho/visual/role/ordinal",
              props: {attributes: {isRequired: true, countMax: 1}}
            }
          }
        ]
      }
    });
    
    return BarModel;
  };
});
```

**After**

```js
define(["module"], function(module) {
  
  "use strict";
  
  return ["pentaho/visual/base/model", function(BaseModel) {
    
    var BarModel = BaseModel.extend({
      $type: {
        id: module.id,
        props: [
          {
            name: "barSize",
            valueType: "number",
            defaultValue: 30,
            isRequired: true
          },
          {
            name: "category",
            base: "pentaho/visual/role/property",
            levels: ["ordinal"],
            attributes: {isRequired: true, countMax: 1}
          }
        ]
      }
    });
    
    return BarModel;
  }];
});
```

### Convert the view
   
The following changes need to be made:
1. Use the new type module format.
2. Rename the top-level `type` to `$type`.
3. Rename the properties' attribute `type` to `valueType`.

**Before**

```js
define([
  "module",
  "pentaho/visual/base/view",
  "./model",
  "d3"
], function(module, baseViewFactory, barModelFactory, d3) {

  "use strict";

  return function(context) {

    var BaseView = context.get(baseViewFactory);

    var BarView = BaseView.extend({
      type: {
        id: module.id,
        props: [
          {
            name: "model",
            type: barModelFactory
          }
        ]
      },
      
      // ...
    });

    return BarView;
  };
});
```

**After**

```js
define(["module", "d3"], function(module, d3) {

  "use strict";

  return [
    "pentaho/visual/base/view",
    "./model",
    function(BaseView, Model) {

      var BarView = BaseView.extend({
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

      return BarView;
    }
  ];
});
```

### Convert the sandbox

It's best to just get the new sandbox code and to paste in the specifics of your visualization again,
as described in 
[Bar/D3 Visualization in Sandbox, Step 1 - Preparing the environment](./samples/bar-d3-sandbox/step1-environment-preparation).
