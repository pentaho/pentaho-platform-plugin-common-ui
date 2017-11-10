---
title: Configuration API
description: The Configuration API provides a means for types to be configured by third-parties.
parent-title: ""
layout: 7.1_default
---

The 
[Configuration API]({{site.refDocsUrlPattern | replace: '$', 'pentaho.config'}}) 
provides a means for _types_ to be configured by third-parties.

**Types** are known by their _string_ identifier and are, for all other purposes, opaque entities
— these may or may not exist as actual JavaScript classes; these may simply represent an interface type.

**Configurations** are JavaScript objects that conform to the 
[`pentaho.config.spec.IRuleSet`]({{site.refDocsUrlPattern | replace: '$', 'pentaho.config.spec.IRuleSet'}}) interface
— essentially, a set of configuration rules,
[`pentaho.config.spec.IRule`]({{site.refDocsUrlPattern | replace: '$', 'pentaho.config.spec.IRule'}}).
Typically, 
configurations are provided as the value returned by an AMD/RequireJS module.
This module needs to be advertised to the configuration system by registering it
with [`pentaho/service`]({{site.refDocsUrlPattern | replace: '$', 'pentaho.service'}}),
as a service of type [`pentaho.config.spec.IRuleSet`]({{site.refDocsUrlPattern | replace: '$', 'pentaho.config.spec.IRuleSet'}}).

**Configuration Rules** are composed of the following parts:

1. The [**select**]({{site.refDocsUrlPattern | replace: '$', 'pentaho.config.spec.IRule#select'}}) object
   specifies the targeted _type_ (or _types_) and the values of any 
   [Pentaho environment variables]({{site.refDocsUrlPattern | replace: '$', 'pentaho.context.IContext'}})
   to which it applies. Alternative values for a variable can be specified using a JavaScript array. 
   The most useful environment variable is 
   [application]({{site.refDocsUrlPattern | replace: '$', 'pentaho.context.IContext#application'}}),
   as it allows creating rules that are only applied when a _type_ is being used by a certain _application_,
   like, for example, 
   [CDF](http://community.pentaho.com/ctools/cdf/) or 
   [Analyzer](http://www.pentaho.com/product/business-visualization-analytics).
   See also [Known Values of Pentaho Environment Variables](#known-values-of-pentaho-environment-variables).
   
2. The [**apply**]({{site.refDocsUrlPattern | replace: '$', 'pentaho.config.spec.IRule#apply'}}) object
   specifies the actual configuration properties and their values.
   You will need to consult the reference documentation of the target _type_ to know the list of available properties.
   For example, the [Visualization API](visual)'s 
   [Model]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.base.Model'}}) type,
   being a [Complex]({{site.refDocsUrlPattern | replace: '$', 'pentaho.type.Complex'}}) type,
   can be configured with the properties of the 
   [IComplexTypeProto]({{site.refDocsUrlPattern | replace: '$', 'pentaho.type.spec.IComplexTypeProto'}}) interface.

3. The [**priority**]({{site.refDocsUrlPattern | replace: '$', 'pentaho.config.spec.IRule#priority'}}) 
   allows fine-tuning the order by which rules that target the same _type_ are merged.
   Higher values have higher priority. It is optional and defaults to `0`.

See 
[Rule Specificity]({{site.refDocsUrlPattern | replace: '$', 'pentaho.config.spec.IRuleSet' | append: '#Rule_Specificity'}}) 
for more information on the the order by which configuration rules having the same target are merged.


## Example Configuration Module

The following is an AMD/RequireJS configuration module that contains two configuration rules:

1. The first rule targets the _type_ `my.ICar`,
when used by the `my-vehicle-editor` _application_,
and specifies the value of its `tireSize` and `exteriorColor` properties.

2. The second rule, has a higher-than-default _priority_, targets the _type_ `my.ICandy`,
whatever the _application_ using it,
and specifies the value of its `cocoaPercentage` and `fillingFlavour` properties.

```js
define(function() {
  
  "use strict";
  
  // The value of the module is an IRuleSet.
  return {
    rules: [
      // IRule 1
      {
        select: {
          type: "my.ICar",
          application: "my-vehicle-editor"
        },
        apply: {
          tireSize: 18,
          exteriorColor: "caribbean-blue"
        }
      },
    
      // IRule 2
      {
        priority: 1,
        select: {
          type: "my.ICandy"
        },
        apply: {
          cocoaPercentage: 0.9,
          fillingFlavour: "orange"
        }
      }
    ]
  }
});
```


## Global Configuration File

_Ad hoc_ configuration rules can be added to the system, by system administrators, 
by placing these in the **global configuration file** — 
a configuration file conveniently registered for you.

The file is located within the Apache Karaf folder at: `config/web-client/config.js`.
Depending on the product, the Karaf folder is located at: 
- PDI: `data-integration/system/karaf/`.
- Pentaho Server: `pentaho-server/pentaho-solutions/system/karaf/`.

Editing and saving the file causes the system to refresh its configuration,
without the need to restart the software.

The configuration file is shipped with a small set of illustrative (but commented-out) rules.

**ATTENTION**: **server upgrades overwrite this file** with an empty version of it, 
so you need to backup the file yourself before upgrading and restore it afterwards.

As an alternative to using the global configuration file, 
you can bundle and deploy your own [Pentaho Web Package](web-package) 
containing a registered configuration module.

Component authors may also wish to provide a default configuration beside the component,
included and registered in the same [Pentaho Web Package](web-package). 


## Known Values of Pentaho Environment Variables
### `application`

| Description | Value              |
|-------------|--------------------|
| CDF         | `pentaho-cdf`      |
| Analyzer    | `pentaho-analyzer` |
| PDI         | `pentaho-det`      |

### `theme`

| Value       |
|-------------|
|`saphire`    |
|`crystal`    |

### `locale`

The possible values are those defined by [RFC 5646](https://tools.ietf.org/html/rfc5646).
