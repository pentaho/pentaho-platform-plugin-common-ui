---
title: Analyzer and the Future Visualization API
description: Covers the availability of the future Visualization API in Analyzer,
             the differences between stock visualizations of the current and future format, 
             how to enable or disable the stock visualizations of the future format and 
             how to migrate custom settings.
parent-title: Visualization API
layout: default
---

## Overview

[Pentaho Analyzer](http://www.pentaho.com/product/business-visualization-analytics) reports display visualizations that 
are based on the [Pentaho Visualization API](.).

As of 7.1, the Pentaho platform ships with the future Visualization API, (internal) version 3.0-**beta**, 
**side-by-side** with the current version, 2.0.
 
Analyzer supports visualizations of both formats,
allowing you 
to evaluate and immediately take advantage of the future format, and 
to convert any custom visualizations of the current format at your own pace.

All [stock visualizations](https://help.pentaho.com/Documentation/7.1/0L0/120/030/010), 
with the exception of the [Geo Map](https://help.pentaho.com/Documentation/7.1/0L0/120/030/010#Geo_Map_Visualization), 
are already available in the future format 
and you **can choose** which format you want Analyzer to use, by configuring an Analyzer setting
(see [Changing the visualization format of stock visualizations](Changing-the-visualization-format-of-stock-visualizations)).
This setting **does not** affect reports that use a custom (non-stock) visualization — 
these will continue to use their visualization format, whether it is the current or future.

Once you choose to use the future format of stock visualizations, 
_viewing_ a previously saved report, with a current format visualization, 
will not change it in any way. 
However, if you save it, it will be irreversibly upgraded to use the future format.
If you later decide to switch-back Analyzer to using the current format of stock visualizations,
the visualization part of this report will not be available and 
the report will be displayed in the Pivot table view.

Fresh Pentaho installations are configured to use the future stock visualizations, 
while upgrade installations are configured to keep using the current stock visualizations.


## Differences between the stock visualizations of the current and future formats

The future stock visualizations are **not** totally identical to 
the corresponding current ones.
Most changes are intentional, enabling new features or fixing faulty behaviours, 
while others are still work in progress, and expected to change when coming out of beta.

The following sections describe the differences that _future_ stock visualizations have 
relative to the _current_ stock visualizations.

### Usability and Style

1. Visualizations scroll horizontally and vertically when too many axis categories exist, 
   instead of shrinking to available space.
2. Selection is either enabled or not, depending on whether there are no gems in the 
   Pivot "Column" gem bar, while there used to be an intermediate selection state where some 
   partial selections were possible if only one gem was in the Pivot "Column" gem bar.
3. General styling of visualizations changed to be aligned platform-wide (e.g. PDI, CDF).
4. Standard color palettes have changed to be aligned platform-wide (e.g. PDI, CDF).

### Breaking changes

1. Visualization configuration is performed in a different way, 
   so existing Analyzer visualization configurations need to be migrated;
   see [Migrating visualization settings](Migrating-visualization-settings).
2. Custom translations for properties of stock visualizations may not work anymore.

### Work In Progress

1. Printing of scrolled charts shrinks them to fit, breaking their aspect-ratio.
2. Printing does not reflect custom configurations.


## Changing the visualization format of stock visualizations.

In a Pentaho Server installation, go to the Analyzer plugin folder, 
located at `pentaho-server/pentaho-solutions/system/analyzer` and 
open the `settings.xml` file.

Find the `<viz-api-version>` setting and change its value according to the desired stock visualization format:

* Use the current format: 
  ```xml
  <viz-api-version>2.0</viz-api-version>
  ```

* Use the future format: 
  ```xml
  <viz-api-version>3.0</viz-api-version>
  ```

Save the file and restart Pentaho Server.

## Migrating visualization settings

Visualizations of the _current_ format can be configured in Analyzer  
through properties in its `analyzer.properties` file,
located at `pentaho-server/pentaho-solutions/system/analyzer`, 
in a Pentaho Server installation.

Visualizations of the _future_ format are however configured using the 
[platform-wide JavaScript configuration system](configuration), 
and so, the current Analyzer visualization settings must be migrated to it.

Despite this, the color palette Analyzer option, `chart.series.colors`, 
is still supported for current and future visualizations.

### General visualization properties

Take the example of a configuration that changes 
the default value of the "Line width" property of "Line chart" visualizations.

1. Current format, in `analyzer.properties`:

    ```properties
    viz.ccc_line.args.lineWidth=1
    ```
    
2. Future format, in a platform configuration file:
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
              "lineWidth": {value: 1}
            }
          }
        }
      ];
    });
    ```
    
To perform the translation, all you need to know is the correspondence between, current and future,
[visualization identifiers](#correspondence-between-visualization-identifiers) and 
[property values](#correspondence-between-visualization-property-values).

### The `maxValues` property

Take the example of a configuration that changes 
the possible _maximum number of results_ for "Bar chart" visualizations.

1. Current format, in `analyzer.properties`:

    ```properties
    viz.ccc_bar.maxValues=250,500,1000,5000
    ```
    
2. Future format, in a platform configuration file:
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
                <ul>
                    <li>lineWidth</li>
                    <li>trendLineWidth</li>
                </ul>
            </td>
            <td>
                The number in the properties file passes verbatim to a JSON number value. 
            </td>
        </tr>
        <tr>
            <td>
                <ul>
                    <li>emptySlicesHidden</li>
                    <li>reverseColors</li>
                </ul>
            </td>
            <td>
                The <code>true</code> or <code>false</code> value in the properties file passes verbatim to 
                a JSON boolean value.
            </td>
        </tr>
        <tr>
            <td>
                <ul>
                    <li>colorSet</li>
                    <li>lineLabelsOption</li>
                    <li>shape</li>
                    <li>sliceOrder</li>
                    <li>trendName</li>
                    <li>trendType</li>
                </ul>
            </td>
            <td>
                The textual value in the properties file is wrapped in quotes to 
                form a JSON string value. E.g.:
                <ul>
                    <li><code>circle</code> &rarr; <code>"circle"</code></li>
                </ul>
            </td>
        </tr>
    </tbody>
</table>
