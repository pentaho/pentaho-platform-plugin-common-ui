---
title: Visualization API
description: A unified way to visualize data across the Pentaho suite.
layout: sub-intro
---

## Overview

The [Visualization API]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual'}}) 
provides a unified way to visualize data across the Pentaho suite 
(e.g.
[Analyzer](https://www.hitachivantara.com/en-us/products/big-data-integration-analytics/pentaho-business-analytics.html), 
[PDI](https://www.hitachivantara.com/en-us/products/big-data-integration-analytics/pentaho-data-integration.html), 
[CDF](https://community.hitachivantara.com/docs/DOC-1009859-cdf-dashboard-framework)).
Essentially, it is a set of abstractions that enables safe, isolated operation between 
applications, visualizations and business logic, provided by third-parties.
It is built on top of other Platform JavaScript APIs:

- The [Data API]({{site.refDocsUrlPattern | replace: '$', 'pentaho.data'}}) 
  ensures seamless integration with data sources in the Pentaho platform, 
  as well as with other client-side component frameworks.

- The [Type API]({{site.refDocsUrlPattern | replace: '$', 'pentaho.type'}}) 
  provides to visualizations out-of-the-box features such as class inheritance, metadata support,  
  validation and serialization.

- The [Core APIs](../../#core) provide to visualizations features such as localization, theming and 
  services registration and consumption.

A set of stock visualizations is included, covering the most common chart types.
Based on the [CCC](https://community.hitachivantara.com/docs/DOC-1009860-ccc-chart-components) charting library, 
they're customizable and extensible to fit your organization's desired look and feel.

If you want to know more about the specifics of how Analyzer integrates with the Visualization API, 
read [Analyzer and the Visualization API](analyzer-viz-api).

The following sections will guide you through the complete process of creating a custom visualization 
for the Pentaho platform, 
from developing it, deploying it to Pentaho products and to configuring it.
 
## Creating a visualization

Creating a visualization boils down to creating:

- One [`Model`]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.Model'}}) class — 
  which _identifies_ the visualization and 
  _defines_ it in terms of its data requirements, 
  such as the visual degrees of freedom it has (e.g. _X position_, _color_ and _size_) and 
  any major options that affect its rendering, — and

- One [`IView`]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.IView'}}) class — 
  which implements the actual rendering using chosen technologies 
  (e.g. [HTML](https://www.w3.org/TR/html/), [SVG](https://www.w3.org/TR/SVG/), [D3](https://d3js.org/))
  and handles user interaction, 
  by dispatching [actions]({{site.refDocsUrlPattern | replace: '$', 'pentaho.visual.action'}})
  (e.g. selection, drilling-down, showing a tooltip).

The [Create a Custom Visualization](create) walk-through shows you how to develop each of these classes and 
how to create an OSGi artifact containing the visualization, 
so that it can be deployed to a Pentaho product.

{% include callout.html content="<h2>Fast-lane</h2>
<p>If you prefer, you can skip the walk-through and get and build the final Pentaho Web Project.
First make sure that you have <code>git</code> and <code>npm</code> installed.</p>

<pre class='highlight'><code># Clone the repository.
git clone https://github.com/pentaho/pentaho-engineering-samples
cd pentaho-engineering-samples
git checkout -b 8.3

# Go to the complete sample's directory.
cd Samples_for_Extending_Pentaho/javascript-apis/platform/visual-samples-bar-d3

# Install the dependencies.
npm install

# Package your files.
npm pack
</code></pre>" type="warning" %}

## Deploying the visualization

To deploy the visualization to a Pentaho product (Pentaho Server or PDI), 
copy the `tgz` file you just built into its `system/karaf/deploy` folder.
See [OSGi Artifacts Deployment](../osgi-deployment) if you need more information.

If everything went well, you should now see your visualization being offered in Analyzer and PDI, 
as well as be able to use it in a [CDE](https://community.hitachivantara.com/docs/DOC-1009858-cde-dashboard-editor) 
dashboard:

1. Your Bar/D3 visualization in Analyzer, showing off the menu and placeholder icon:
   
   <img src="img/sample-bar-d3-analyzer-placeholder-styled.png" alt="Bar/D3 in Analyzer - Menu and Placeholder" style="width: 767px;">
   
1. Your Bar/D3 visualization in Analyzer, rendering:
   
   <img src="img/sample-bar-d3-analyzer.png" alt="Bar/D3 in Analyzer" style="width: 767px;">

2. Your Bar/D3 visualization in PDI, showing off the menu and placeholder icon:
   
   <img src="img/sample-bar-d3-pdi-menu-selected-styled.png" alt="Bar/D3 in PDI - Menu and Placeholder" style="width: 767px;">
   
3. Your Bar/D3 visualization in PDI, rendering:
   
   <img src="img/sample-bar-d3-pdi.png" alt="Bar/D3 in PDI" style="width: 777px;">

4. Your Bar/D3 visualization in CDE:
   
   You can get the following dashboard from
   [pentaho/pentaho-engineering-samples]({{site.platformSamplesBaseUrl | append: "javascript-apis/platform/visual-samples-bar-d3-cde"}}).
   
   <img src="img/sample-bar-d3-cde.png" alt="Bar/D3 in CDE" style="width: 777px;">

## Configuring the visualization

A visualization can be configured by third-parties using configuration rules in external configuration files.
These configurations are merged with any default configuration that is included with the visualization.

See [Configuring a Visualization](configuration) for more details.
