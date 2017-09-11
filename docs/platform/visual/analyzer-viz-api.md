---
title: Analyzer and the Visualization API
description: Covers the availability of the new Visualization API in Analyzer,
             the differences between stock visualizations of the previous and new format, 
             how to enable or disable the stock visualizations of the new format and 
             how to migrate custom settings.
parent-title: Visualization API
layout: default
---

## Overview

[Pentaho Analyzer](http://www.pentaho.com/product/business-visualization-analytics) reports display visualizations that 
are based on the [Pentaho Visualization API](.).

As of version 7.1, the Pentaho platform ships with the _new_ version of the Visualization API, still in **beta**, 
**side-by-side** with the _previous_ version.
 
Analyzer supports visualizations of both formats,
allowing you 
to evaluate and immediately take advantage of the new format, and 
to convert any custom visualizations of the previous format at your own pace.

All [stock visualizations](https://help.pentaho.com/Documentation/7.1/0L0/120/030/010), 
with the exception of the [Geo Map](https://help.pentaho.com/Documentation/7.1/0L0/120/030/010#Geo_Map_Visualization), 
are already available in the new format 
and you **can choose** which format you want Analyzer to use, by configuring an Analyzer setting
(see [Changing the visualization format of stock visualizations](#changing-the-visualization-format-of-stock-visualizations)).
This setting **does not** affect reports that use a custom (non-stock) visualization — 
these will continue to use their visualization format, whether it is the previous or new.

Once you choose to use the new format of stock visualizations, 
_viewing_ a previously saved report, with a visualization of the previous format, 
will not change it in any way. 
However, if you save it, it will be irreversibly upgraded to use the new format.
If you later decide to switch-back Analyzer to using the previous format of stock visualizations,
the visualization part of this report will not be available and 
the report will be displayed in the Pivot table view.

{% include callout.html content="<h2>Remember</h2>
<p>When you choose to try out the new format of stock visualizations:</p>
<ol>
    <li>For precaution, be sure to create a backup of your existing Analyzer reports.</li>
    <li>To be sure that you are satisfied with the new experience, 
        test all of your existing Analyzer reports before saving any of them.
    </li>
</ol>" type="warning" %}

Fresh Pentaho installations are configured to use the new format stock visualizations, 
while upgrade installations are configured to keep using the previous format stock visualizations.


## Differences between the stock visualizations of the previous and new formats

The new stock visualizations are **not** totally identical to 
the corresponding previous ones.
Most changes are intentional, enabling new features or fixing faulty behaviours, 
while others are still work in progress, and expected to change when coming out of _beta_.

The following sections describe the differences that _new_ stock visualizations have 
relative to the _previous_ stock visualizations.

### Usability and Style

1. Visualizations scroll horizontally and vertically when too many axis categories exist, 
   instead of shrinking to available space.
2. Selection is either enabled or not, depending on whether there are no _gems_ in the 
   Pivot "Column" gem bar, while there used to be an intermediate selection state where some 
   partial selections were possible if only one gem was in the Pivot "Column" gem bar.
3. General styling of visualizations changed to be aligned platform-wide (e.g. PDI, CDF).
4. Standard color palettes have changed to be aligned platform-wide (e.g. PDI, CDF).

### Breaking changes

1. Visualization configuration is performed in a different way, 
   so existing Analyzer visualization configurations need to be migrated;
   see [Migrating visualization settings](#migrating-visualization-settings).
2. Custom translations for properties of stock visualizations may not work anymore.

### Work In Progress

1. Printing of scrolled charts shrinks them to fit, breaking their aspect-ratio.
2. Printing does not reflect custom configurations.

## Changing the visualization format of stock visualizations.

In a Pentaho Server installation, go to the Analyzer plugin folder, 
located at `pentaho-server/pentaho-solutions/system/analyzer` and 
open the `settings.xml` file.

Find the `<viz-api-version>` setting and change its value according to the desired stock visualization format:

* Use the previous format: 
  ```xml
  <viz-api-version>2.0</viz-api-version>
  ```

* Use the new format: 
  ```xml
  <viz-api-version>3.0</viz-api-version>
  ```

Save the file and restart Pentaho Server.

## Migrating visualization settings

Visualizations of the _previous_ format can be configured in Analyzer  
through properties in its `analyzer.properties` file,
located at `pentaho-server/pentaho-solutions/system/analyzer`, 
in a Pentaho Server installation.

Visualizations of the _new_ format are however configured using the 
[platform-wide JavaScript configuration system](configuration), 
and so, the Analyzer _previous_ format visualization settings must be migrated to it.

### General visualization properties

Take the example of a configuration that changes 
the default value of the "Line width" property of "Line chart" visualizations.

1. Previous format, in `analyzer.properties`:

    ```properties
    viz.ccc_line.args.lineWidth=1
    ```
    
2. New format, in a platform configuration file:
    ```js
    define(function() {
      return [
        {
          select: {
            application: "pentaho-analyzer",
            type: "pentaho/visual/models/line"
          },
          apply: {
            props: {
              "lineWidth": {defaultValue: 1}
            }
          }
        }
      ];
    });
    ```
    
To perform the translation, all you need to know is the correspondence between, previous and new,
[visualization identifiers](#correspondence-between-visualization-identifiers) and 
[property values](#correspondence-between-visualization-property-values).

### The `maxValues` property

Take the example of a configuration that changes 
the possible _maximum number of results_ for "Bar chart" visualizations.

1. Previous format, in `analyzer.properties`:

    ```properties
    viz.ccc_bar.maxValues=250,500,1000,5000
    ```
    
2. New format, in a platform configuration file:
    ```js
    define(function() {
      return [
        {
          select: {
            application: "pentaho-analyzer",
            type: "pentaho/visual/models/barHorizontal"
          },
          apply: {
            application: {
              maxValues: [250, 500, 1000, 5000]
            }
          }
        }
      ];
    });
    ```

### The `chart.series.colors` property

This property allows changing the default discrete color palette.

1. Previous format, in `analyzer.properties`:

    ```properties
    chart.series.colors=#0045a1,#5f9e00,#ffc20f,#ff6600,#3c008f
    ```
    
2. New format, in a platform configuration file:
    ```js
    define(function() {
      return [
        {
          select: {
            application: "pentaho-analyzer",
            instance: "pentaho/visual/color/palettes/nominalPrimary"
          },
          apply: {
            colors: [
              "#0045a1","#5f9e00","#ffc20f","#ff6600","#3c008f"
            ]
          }
        }
      ];
    });
    ```

### Correspondence between visualization identifiers

| Current Vis. Id.      | Future Vis. Id.                               | Description          |
|-----------------------|-----------------------------------------------|----------------------|
| ccc_area              | pentaho/visual/models/areaStacked             | Area Stacked         |
| ccc_line              | pentaho/visual/models/line                    | Line                 |
| ccc_bar               | pentaho/visual/models/bar                     | Column               |
| ccc_barstacked        | pentaho/visual/models/barStacked              | Column Stacked       |
| ccc_barnormalized     | pentaho/visual/models/bar                     | Column Stacked 100%  |
| ccc_horzbar           | pentaho/visual/models/barHorizontal           | Bar                  |
| ccc_horzbarstacked    | pentaho/visual/models/barStackedHorizontal    | Bar Stacked          |
| ccc_horzbarnormalized | pentaho/visual/models/barNormalizedHorizontal | Bar Stacked 100%     |
| ccc_barline           | pentaho/visual/models/barLine                 | Column/Line Combo    |
| ccc_scatter           | pentaho/visual/models/bubble                  | X/Y Scatter/Bubble   |
| ccc_heatgrid          | pentaho/visual/models/heatGrid                | Heat-Grid            |
| ccc_pie               | pentaho/visual/models/pie                     | Pie                  |
| ccc_sunburst          | pentaho/visual/models/sunburst                | Sunburst             |


### Correspondence between visualization property values

<table>
    <tbody>
        <tr>
            <th>Property Name</th>
            <th>Value changes</th>
        </tr>
        <tr>
            <td>labelsOption</td>
            <td>
                <ul>
                    <li><code>inside_end</code> &rarr; <code>"insideEnd"</code></li>
                    <li><code>inside_base</code> &rarr; <code>"insideBase"</code></li>
                    <li><code>outside_end</code> &rarr; <code>"outsideEnd"</code></li>
                </ul>
            </td>
        </tr>
        <tr>
            <td>pattern</td>
            <td>
                <ul>
                    <li><code>ryg_3</code> &rarr; <code>"ryg-3"</code></li>
                    <li><code>ryg_5</code> &rarr; <code>"ryg-5"</code></li>
                    <li><code>ryb_3</code> &rarr; <code>"ryb-3"</code></li>
                    <li><code>ryb_5</code> &rarr; <code>"ryb-5"</code></li>
                    <li><code>blue_3</code> &rarr; <code>"blue-3"</code></li>
                    <li><code>blue_5</code> &rarr; <code>"blue-5"</code></li>
                    <li><code>gray_3</code> &rarr; <code>"gray-3"</code></li>
                    <li><code>gray_5</code> &rarr; <code>"gray-5"</code></li>
                </ul>
            </td>
        </tr>
        <tr>
            <td>
                lineWidth
            </td>
            <td rowSpan="2">
                The number in the properties file passes verbatim to a JSON number value. 
            </td>
        </tr>
        <tr>
            <td>
                trendLineWidth
            </td>
        </tr>
        <tr>
            <td>
                emptySlicesHidden
            </td>
            <td rowSpan="2">
                The <code>true</code> or <code>false</code> value in the properties file passes verbatim to 
                a JSON boolean value.
            </td>
        </tr>
        <tr>
            <td>
                reverseColors
            </td>
        </tr>
        <tr>
            <td>colorSet</td>
            <td rowSpan="6">
                The textual value in the properties file is wrapped in quotes to 
                form a JSON string value. E.g.:
                <ul>
                    <li><code>circle</code> &rarr; <code>"circle"</code></li>
                </ul>
            </td>
        </tr>
        <tr>
            <td>lineLabelsOption</td>
        </tr>
        <tr>
            <td>shape</td>
        </tr>
        <tr>
            <td>sliceOrder</td>
        </tr>
        <tr>
            <td>trendName</td>
        </tr>
        <tr>
            <td>trendType</td>
        </tr>
    </tbody>
</table>
