---
title: What's new and changed in the Visualization API beta 3
description: Describes the new and changed features in the beta 3 of the Visualization API.
parent-title: Visualization API
layout: default
---

You might also want to take a look at 
[What's new and changed in the Platform JavaScript APIs beta 3](../whats-new-beta-3). 

## New and changed features

### Changed syntax for declaring a visual role property

In this release, we simplified, once more, the syntax for declaring visual roles.

Specifically, the two attributes `levels` and `dataType` which were used to define the _type of visual role_
were replaced by a single [modes]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.role.PropertyType#modes'}})
attribute.
Instead of using explicit _levels of measurement_ terms to classify visual roles 
(terms such as _quantitative_, _nominal_ and _ordinal_), 
we opted to use the simpler, more familiar continuous/categorical dichotomy.

In another front, the term `attributes`, 
which was used when defining the cardinality constraints of a visual role and 
when mapping it to specific data source fields,
was renamed to `fields`.

Lets see some examples using the old and the new syntax.

1. Ordinal visual role which accepts zero or one string fields

    ```js
    // Old syntax
    BaseModel.extend({
     $type: {
       props: [
         {
           name: "category",
           base: "pentaho/visual/role/property",
           levels: ["ordinal"],
           dataType: "string",
           attributes: {
             countMax: 1
           }
         }
       ]
     }
    });
    
    // New syntax
    BaseModel.extend({
     $type: {
       props: [
         {
           name: "category",
           base: "pentaho/visual/role/property",
           modes: [{dataType: "string"}]
           // or, simpler, just like: 
           // modes: ["string"]
         }
       ]
     }
    });
    ```
    
    Note that, under the new interpretation, 
    because the data type `"string"` already only accepts a single value, 
    the old `countMax: 1` configuration is not necessary anymore.

2. Nominal visual role which accepts one string field

    ```js
    // Old syntax
    BaseModel.extend({
     $type: {
       props: [
         {
           name: "category",
           base: "pentaho/visual/role/property",
           levels: ["nominal"],
           dataType: "string",
           attributes: {
             countMin: 1,
             countMax: 1
           }
         }
       ]
     }
    });
    
    // New syntax
    BaseModel.extend({
     $type: {
       props: [
         {
           name: "category",
           base: "pentaho/visual/role/property",
           modes: [{dataType: "string"}],
           fields: {
             isRequired: true 
             // or, equivalently:
             // countMin: 1
           }
         }
       ]
     }
    });
    ```

3. Nominal visual role which accepts zero or more fields, of any data type

    ```js
    // Old syntax
    BaseModel.extend({
     $type: {
       props: [
         {
           name: "category",
           base: "pentaho/visual/role/property",
           levels: ["nominal"]
         }
       ]
     }
    });
    
    // New syntax
    BaseModel.extend({
     $type: {
       props: [
         {
           name: "category",
           base: "pentaho/visual/role/property",
           modes: [{dataType: "list"}]
         }
       ]
     }
    });
    ```

4. Quantitative visual role which accepts one number field

    ```js
    // Old syntax
    BaseModel.extend({
     $type: {
       props: [
         {
           name: "measure",
           base: "pentaho/visual/role/property",
           levels: ["quantitative"],
           dataType: "number",
           attributes: {
             countMin: 1,
             countMax: 1
           }
         }
       ]
     }
    });
    
    // New syntax
    BaseModel.extend({
     $type: {
       props: [
         {
           name: "measure",
           base: "pentaho/visual/role/property",
           modes: [{dataType: "number"}],
           fields: {isRequired: true}
         }
       ]
     }
    });
    ```

5. Quantitative visual role which accepts zero or one, number or date field
    
    ```js
    // Old syntax
    BaseModel.extend({
     $type: {
       props: [
         {
           name: "measure",
           base: "pentaho/visual/role/property",
           levels: ["quantitative"],
           attributes: {
             countMax: 1
           }
         }
       ]
     }
    });
    
    // New syntax
    BaseModel.extend({
     $type: {
       props: [
         {
           name: "measure",
           base: "pentaho/visual/role/property",
           modes: [
             {dataType: "date"},
             {dataType: "number"}
           ]
         }
       ]
     }
    });
    ```


6. Nominal visual role which accepts zero or one, number field

    ```js
    // Old syntax
    BaseModel.extend({
     $type: {
       props: [
         {
           name: "measure",
           base: "pentaho/visual/role/property",
           levels: ["nominal"],
           dataType: "number",
           attributes: {
             countMax: 1
           }
         }
       ]
     }
    });
    
    // New syntax
    BaseModel.extend({
     $type: {
       props: [
         {
           name: "measure",
           base: "pentaho/visual/role/property",
           modes: [
             {dataType: "number", isContinuous: false}
           ]
         }
       ]
     }
    });
    ```

7. Quantitative visual role which accepts zero or more number fields

    ```js
    // Old syntax
    BaseModel.extend({
     $type: {
       props: [
         {
           name: "measure",
           base: "pentaho/visual/role/property",
           levels: ["quantitative"],
           dataType: "number"
         }
       ]
     }
    });
    
    // New syntax
    BaseModel.extend({
     $type: {
       props: [
         {
           name: "measure",
           base: "pentaho/visual/role/property",
           modes: [{dataType: ["number"]}]
         }
       ]
     }
    });
    ```
    
    Note that the data type `["number"]` denotes that the "composite value" of the visual role is a list of numbers.

### Renamed Mapping `attributes` to `fields`

The `View` code needs to know which fields are mapped to a visual role.
The visual role `Mapping` class was changed to expose the list of mapped fields under the 
[pentaho.visual.role.Mapping#fields]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.role.Mapping#fields'}})
property.

Example of old and new view code to obtain the column indexes of the fields mapped to the visual roles:

```js
// Old code
var model = this.model;

// The name of the data attributes that are mapped to the visual roles
var categoryAttribute = model.category.attributes.at(0).name;
var measureAttribute = model.measure.attributes.at(0).name;

// Their column indexes in the data table.
var categoryColumn = dataTable.getColumnIndexByAttribute(categoryAttribute);
var measureColumn = dataTable.getColumnIndexByAttribute(measureAttribute);

          
// New code
var model = this.model;

// The name of the data attributes that are mapped to the visual roles
var categoryFieldName = model.category.fields.at(0).name;
var measureFieldName = model.measure.fields.at(0).name;

// Their column indexes in the data table.
var categoryFieldIndex = dataTable.getColumnIndexById(categoryFieldName);
var measureFieldIndex = dataTable.getColumnIndexById(measureFieldName);
```

Note that, additionally, the data table method `getColumnIndexByAttribute` has been renamed to `getColumnIndexById`.

### New _Scenes_ helper class to speed up writing the code of Views{{site.starNew}}

The code of a `View` class is, in part, 
made up of code that transforms the data in the data table into a form which is suitable for rendering.
This form is typically written in the namespace of visual roles, such as in: 
the value of `x` is `1` and the value of `series` is `Portugal`.
The name of the fields which were mapped to the visual roles are not relevant for most rendering purposes.

Additionally, when handling user interaction, a view needs to, for example, 
translate mouse events on specific visual elements into actions such as 
[pentaho.visual.action.Select]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.action.Select'}}) or
[pentaho.visual.action.Execute]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.action.Execute'}}).
Actions receive as input a filter that describes in the original data terms the data that was acted upon
(_select_ the rows whose `country` has value `Portugal`).

The [pentaho.visual.scene.Base]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.scene.Base'}})
helper class greatly simplifies the code you need to write to correctly handle these two needs.

Check out the following comparison of code written with and without the helper class:

1. When transforming the data table into a renderable form
    ```js
    // Without
    var model = this.model;
    
    // The name of the data attributes that are mapped to the visual roles
    var categoryFieldName = model.category.fields.at(0).name;
    var measureFieldName = model.measure.fields.at(0).name;
    
    // Their column indexes in the data table.
    var categoryFieldIndex = dataTable.getColumnIndexById(categoryFieldName);
    var measureFieldIndex = dataTable.getColumnIndexById(measureFieldName);
    
    var scenes = [];
    
    for(var i = 0, R = dataTable.getNumberOfRows(); i < R; i++) {
        scenes.push({
          category: dataTable.getValue(i, categoryFieldIndex),
          categoryLabel: dataTable.getFormattedValue(i, categoryFieldIndex),
          measure: dataTable.getValue(i, measureFieldIndex),
          rowIndex: i
        });
    }
 
    // With
    var scenes = Scene.buildScenesFlat(this).children;
    ```
    
2. When accessing the values of scenes:
    ```js
    // Without
    x.domain(scenes.map(function (d) { return d.categoryLabel; }));
    y.domain([0, d3.max(scenes, function (d) { return d.measure; })]);
    
    // With
    x.domain(scenes.map(function(scene) { return scene.vars.category.formatted; }));
    y.domain([0, d3.max(scenes, function(scene) { return scene.vars.measure.value; })]);
    ```
    
2. When handling the `Select` action:
    ```js
    // Without
    cc.on("click", function(event, d) {
      var filterSpec = {_: "=", property: categoryFieldName, value: d.category};
      
      var action = new SelectAction({
        dataFilter: filterSpec, 
        selectionMode: event.ctrlKey || event.metaKey ? "toggle" : "replace"
      });
     
      view.act(action);
    });
    
    // With
    cc.on("click", function(event, scene) {
      var filter = scene.createFilter();
      
      var action = new SelectAction({
        dataFilter: filter,
        selectionMode: event.ctrlKey || event.metaKey ? "toggle" : "replace"
      });
   
      view.act(action);
    });
    ```

## Procedure for converting a visualization from beta 2 to beta 3

### Convert the syntax of the visual role definitions in the model.

Follow the correspondence examples given before.

### Convert the code of views that read the mappings' fields.

Follow the correspondence examples given before.

Optionally, convert the code to use the 
[pentaho.visual.scene.Base]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.scene.Base'}}) helper.

### Convert any CDF/CDE dashboards

If you use your visualization in a CDF/CDE dashboard, do not forget to replace the value of parameters 
that specify the value of visual roles, from, for example, `{attributes: ["country"]}` to `{fields: ["country"]}`.

### Convert the sandbox

It's best to just get the new sandbox code and to paste in the specifics of your visualization again,
as described in 
[Bar/D3 Visualization in Sandbox, Step 1 - Preparing the environment](./samples/bar-d3-sandbox/step1-environment-preparation).
