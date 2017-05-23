---
title: Visualization API
description: A unified way to visualize data across the Pentaho suite.
layout: sub-intro
---

# Overview

{% include callout.html content="<p>As of version 7.1, 
the Pentaho platform ships with a <em>new</em>, <b>beta</b> version of the Visualization API, 
<b>side-by-side</b> with the <em>previous</em> version. 
This documentation relates to the new version.</p>
" type="warning" %}

The [Visualization API]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual'}}) 
provides a unified way to visualize data across the Pentaho suite 
(e.g.
[Analyzer](http://www.pentaho.com/product/business-visualization-analytics), 
[PDI](http://www.pentaho.com/product/data-integration), 
[CDF](http://community.pentaho.com/ctools/cdf/)).

Essentially, it is a set of abstractions that enables safe, isolated operation between 
applications, visualizations and business logic.

A **visualization** is constituted by:

- One [`Model`]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.base.Model'}}), 
  which _identifies_ the visualization and 
  _defines_ it in terms of its their data requirements, 
  such as the visual degrees of freedom it has (e.g. _X position_, _color_ and _size_) and 
  any major options that affect its rendering.

- One [`View`]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.base.View'}}) (at least), 
  which implements the actual rendering using chosen technologies 
  (e.g. [HTML](https://www.w3.org/TR/html/), [SVG](https://www.w3.org/TR/SVG/), [D3](https://d3js.org/)),
  and handle user interaction, 
  dispatching [actions]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.action'}}) and, 
  for example, showing tooltips.

The Visualization API is built on top of other Platform JavaScript APIs:

- The [Data API]({{site.refDocsUrlPattern | replace: '$', 'pentaho.data'}}) 
  ensures seamless integration with data sources in the Pentaho platform, 
  as well as with other client-side component frameworks.

- The [Type API]({{site.refDocsUrlPattern | replace: '$', 'pentaho.type'}}) 
  provides to visualizations out-of-the-box features such as class inheritance, metadata support, configuration, 
  validation and serialization.

- The [Core APIs](../../#core) provide to visualizations features such as localization, theming and 
  services registration and consumption.

A set of stock visualizations is included, covering the most common chart types.
Based on the [CCC](http://community.pentaho.com/ctools/ccc/) charting library, 
they're customizable and extensible to fit your organization's desired look and feel.

If you want to know more about the specifics of how Analyzer exposes the Visualization API, 
read [Analyzer and the Visualization API](analyzer-viz-api).

The following sections will guide you through the complete process of creating a custom visualization 
for the Pentaho platform, 
from [developing it](#create-a-visualization), 
to [deploying it](#deploy-the-visualization) to Pentaho products and 
to [configuring it](#configure-the-visualization).
 
# Create a visualization

Read the [Create a Custom Visualization](create) walk-through.

# Deploy the visualization

See [OSGi Artifacts Deployment](../osgi-deployment) for quick instructions on 
how to deploy the KAR file you just built (located at `assemblies/target`).

If everything went well, you should now see your visualization being offered in Analyzer and/or PDI:

1. Your Bar/D3 visualization in Analyzer:
   
   <img src="img/sample-bar-d3-analyzer.png" alt="Bar/D3 in Analyzer" style="width: 767px;">

2. Your Bar/D3 visualization in the PDI menu:
   
   <img src="img/sample-bar-d3-pdi-menu.png" alt="Bar/D3 in PDI - menu" style="width: 365px;">
   
3. Your Bar/D3 visualization in PDI:
   
   <img src="img/sample-bar-d3-pdi.png" alt="Bar/D3 in PDI" style="width: 777px;">

<!-- TODO: Explain how to distribute it using marketplace? -->

# Configure the visualization

Besides the default configuration you have included with the visualization,
the visualization can be further configured by third-parties. 

See [Configuring a Visualization](configuration) for more details.
