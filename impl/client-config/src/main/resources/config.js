/*!
 * Copyright 2017 Pentaho Corporation. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

define(function() {
  "use strict";

  /*
   * In this file you can add configuration rules that fine tune the look and behaviour
   * of visualizations when displayed in different applications.
   *
   * Known Application Ids:
   * 1. PDI Preview - "pentaho-det"
   * 2. Pentaho Analyzer - "pentaho/analyzer"
   * 3. Pentaho CDF/CDE - "pentaho-cdf"
   *
   * CCC-family visualization ids:
   * 1. Pie - "pentaho/visual/ccc/areaStacked"
   * 2. Column - "pentaho/visual/ccc/bar"
   * 3. Bar - "pentaho/visual/ccc/barHorizontal"  Normalized
   * 4. Stacked Column - "pentaho/visual/ccc/barStacked"
   * 5. Stacked Bar - "pentaho/visual/ccc/barStackedHorizontal"
   * 6. 100% Stacked Column - "pentaho/visual/ccc/barNormalized"
   * 7. 100% Stacked Bar - "pentaho/visual/ccc/barNormalizedHorizontal"
   * 8. Column-Line Combo - "pentaho/visual/ccc/barLine"
   * 9. Scatter - "pentaho/visual/ccc/scatter"
   * 10. Bubble - "pentaho/visual/ccc/bubble"
   * 11. Pie - "pentaho/visual/ccc/pie"
   * 12. Donut - "pentaho/visual/ccc/donut"
   * 13. Sunburst - "pentaho/visual/ccc/sunburst"
   * 14. Heat Grid - "pentaho/visual/ccc/heatGrid"
   *
   * Sample visualization ids:
   * 1. Calculator - "pentaho/visual/samples/calc"
   */
  return {
    rules: [
      // Example Rule 1 - Hide the Pie chart from both PDI Preview and Pentaho Analyzer
      /*
      {
        select: {
          application: ["pentaho-det", "pentaho/analyzer"],
          type: "pentaho/visual/ccc/pie"
        },
        apply: {
          isBrowsable: false
        }
      },
      */

      // Example Rule 2 - Change the menu label of the 100% Stacked Bar chart in Pentaho Analyzer
      /*
      {
        select: {
          application: "pentaho/analyzer",
          type: "pentaho/visual/ccc/barNormalizedHorizontal"
        },
        apply: {
          label: "Relative Proportion Bar"
        }
      },
      */

      // Example Rule 3 - Change the default dot shape of Line and Bar/Line charts, in any application,
      //   and hide the option from the user.
      /*
      {
        select: {
          type: [
            "pentaho/visual/ccc/line",
            "pentaho/visual/ccc/barLine"
          ]
        },
        apply: {
          props: {
            shape: {
              value: "diamond",
              isBrowsable: false
            }
          }
        }
      },
      */

      // Example Rule 4 - Use CCC extension points to change the Donut chart's inner radius.
      /*
      {
        select: {
          application: "pentaho/analyzer",
          type: "pentaho/visual/ccc/donut"
        },
        apply: {
          extension: {
            slice_innerRadiusEx: "40%"
          }
        }
      }
      */
    ]
  };
});
