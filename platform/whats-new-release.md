---
title: What's new and changed in the Platform JavaScript APIs release
description: Describes the new and changed features in the release version of the Platform JavaScript APIs, relative to the beta 4 version.
layout: default
---

## Platform JavaScript APIs

### Application identifiers have changed

The application identifiers which are used for scoping configuration rules have changed. 
These are now AMD/RequireJS module identifiers.

| Description                     | New Value                   | Old Value                   |
|---------------------------------|-----------------------------|-----------------------------|
| CDF                             | `pentaho/cdf`               | `pentaho-cdf`               |
| Analyzer                        | `pentaho/analyzer`          | `pentaho-analyzer`          |
| Analyzer in Dashboard Designer  | `pentaho/dashboardDesigner` | `pentaho-dashboards`        |
| PDI                             | `pentaho/det`               | `pentaho-det`               |

### Modules API

A new concept, [module annotations]({{site.refDocsUrlPattern | replace: '$', 'pentaho.module.Annotation'}}){{site.starNew}}, 
was introduced to allow extending the configuration of modules 
with metadata whose schema is controlled by a third-party.

For example, 
applications such as Analyzer and PDI support certain per-visualization configuration properties.
These properties are now specified in an annotation associated with the visualization model's module.
The following ruleset module uses the `pentaho/analyzer/visual/OptionsAnnotation` annotation 
to indicate to Analyzer how it should handle a drill-down for the `my/viz/Model` model: 

```js
define({
  rules: [
    {
      select: {
        module: "my/viz/Model",
        annotation: "pentaho/analyzer/visual/Options",
        application: "pentaho/analyzer"
      },
      apply: {
        keepLevelOnDrilldown: false
      }
    }
  ]
});
```

### Theming API{{site.starNew}}

The 
[Theming API]({{site.refDocsUrlPattern | replace: '$', 'pentaho.theme'}}) 
coordinates the interaction between applications, visualizations and systems integrators 
on the definition and application of CSS styles for the DOM elements these provide.

One notable change introduced by the Theming API is that the CSS class associated with modules
is now automatically determined 
(see 
[getModuleCssClass]({{site.refDocsUrlPattern | replace: '$', 'pentaho.theme.IService' | append: '#getModuleCssClass'}})).
Previously, the Type API allowed the specification of the CSS class through the `styleClass` attribute.

### Visualization API

See [What's new and changed in the Visualization API]({{ "/platform/visual/whats-new-release" | relative_url }}).
