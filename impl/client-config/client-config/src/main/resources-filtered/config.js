/*!
 * Copyright 2017 - 2018 Hitachi Vantara. All rights reserved.
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

define(["require"], function(localRequire) {

  "use strict";

  /*
   * In this file you can add configuration rules that fine tune the look and behaviour
   * of visualizations when displayed in different applications.
   *
   * Known Application Ids:
   * 1. PDI Data Inspection - "pentaho-det"
   * 2. Pentaho Analyzer - "pentaho-analyzer"
   * 3. Pentaho Analyzer in Dashboards - "pentaho-dashboards"
   * 4. Pentaho CDF/CDE - "pentaho-cdf"
   *
   * Stock visualizations' model ids:
   * 1. AreaStacked - "pentaho/visual/models/AreaStacked"
   * 2. Line - "pentaho/visual/models/Line"
   * 3. Column - "pentaho/visual/models/Bar"
   * 4. Bar - "pentaho/visual/models/BarHorizontal"
   * 5. Stacked Column - "pentaho/visual/models/BarStacked"
   * 6. Stacked Bar - "pentaho/visual/models/BarStackedHorizontal"
   * 7. 100% Stacked Column - "pentaho/visual/models/BarNormalized"
   * 8. 100% Stacked Bar - "pentaho/visual/models/BarNormalizedHorizontal"
   * 9. Column-Line Combo - "pentaho/visual/models/BarLine"
   * 10. Scatter - "pentaho/visual/models/Scatter"
   * 11. Bubble - "pentaho/visual/models/Bubble"
   * 12. Pie - "pentaho/visual/models/Pie"
   * 13. Donut - "pentaho/visual/models/Donut"
   * 14. Sunburst - "pentaho/visual/models/Sunburst"
   * 15. Heat Grid - "pentaho/visual/models/HeatGrid"
   * 16. Geo Map - "pentaho/geo/visual/Model"
   *
   * Stock visualizations' view ids:
   * 1. AreaStacked - "pentaho/ccc/visual/AreaStacked"
   * 2. Line - "pentaho/ccc/visual/Line"
   * 3. Column - "pentaho/ccc/visual/Bar"
   * 4. Bar - "pentaho/ccc/visual/BarHorizontal"  Normalized
   * 5. Stacked Column - "pentaho/ccc/visual/BarStacked"
   * 6. Stacked Bar - "pentaho/ccc/visual/BarStackedHorizontal"
   * 7. 100% Stacked Column - "pentaho/ccc/visual/BarNormalized"
   * 8. 100% Stacked Bar - "pentaho/ccc/visual/BarNormalizedHorizontal"
   * 9. Column-Line Combo - "pentaho/ccc/visual/BarLine"
   * 10. Scatter - "pentaho/ccc/visual/Scatter"
   * 11. Bubble - "pentaho/ccc/visual/Bubble"
   * 12. Pie - "pentaho/ccc/visual/Pie"
   * 13. Donut - "pentaho/ccc/visual/Donut"
   * 14. Sunburst - "pentaho/ccc/visual/Sunburst"
   * 15. Heat Grid - "pentaho/ccc/visual/HeatGrid"
   * 16. Geo Map - "pentaho/geo/visual/View"
   *
   * Sample visualization model ids:
   * 1. Calculator - "pentaho/visual/samples/calc/Model"
   *
   * Stock color palettes' ids:
   * 1. pentaho/visual/color/palettes/nominalPrimary
   * 2. pentaho/visual/color/palettes/nominalNeutral
   * 3. pentaho/visual/color/palettes/nominalLight
   * 4. pentaho/visual/color/palettes/nominalDark
   * 5. pentaho/visual/color/palettes/quantitativeBlue3
   * 6. pentaho/visual/color/palettes/quantitativeBlue5
   * 7. pentaho/visual/color/palettes/quantitativeGray3
   * 8. pentaho/visual/color/palettes/quantitativeGray5
   * 9. pentaho/visual/color/palettes/divergentRyb3
   * 10. pentaho/visual/color/palettes/divergentRyb5
   * 11. pentaho/visual/color/palettes/divergentRyg3
   * 12. pentaho/visual/color/palettes/divergentRyg5
   */
  return {
    rules: [
      // Example Rule 1 - Hide the Pie chart from both PDI Preview and Pentaho Analyzer
      /*
      {
        select: {
          application: ["pentaho-det", "pentaho-analyzer"],
          module: "pentaho/visual/models/Pie"
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
          application: "pentaho-analyzer",
          module: "pentaho/visual/models/BarNormalizedHorizontal"
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
          module: [
            "pentaho/visual/models/Line",
            "pentaho/visual/models/BarLine"
          ]
        },
        apply: {
          props: {
            shape: {
              defaultValue: "diamond",
              isBrowsable: false
            }
          }
        }
      },
      */

      // Example Rule 4 - Use CCC extension points to change the Donut CCC view's inner radius, in Pentaho Analyzer.
      /*
      {
        select: {
          application: "pentaho-analyzer",
          module: "pentaho/ccc/visual/Donut"
        },
        apply: {
          extension: {
            slice_innerRadiusEx: "40%"
          }
        }
      },
      */

      // Example Rule 5 - Change the colors of the default discrete color palette, in any application.
      /*
      {
        select: {
          module: "pentaho/visual/color/palettes/nominalPrimary"
        },
        apply: {
          colors: [
            "red", "#00FF00", "rgb(0,0,255)"
          ]
        }
      },
      */

      // Example Rule 6 - Change the colors of the bar chart visualization, in any application
      /*
      {
        select: {
          module: "pentaho/visual/models/Bar"
        },
        apply: {
          props: {
            palette: {
              defaultValue: {
                level: "nominal",
                colors: ["red", "#00FF00", "rgb(0,0,255)"]
              }
            }
          }
        }
      },
      */

      // Example Rule 7 - Change the colors of the bar chart visualization, in any application,
      // by using a registered palette
      /*
       {
        select: {
          module: "pentaho/visual/models/Bar"
        },
        deps: [
          "pentaho/visual/color/palettes/nominalLight"
        ],
        apply: function(nominalLightPalette) {
          return {
            props: {
              palette: {
                defaultValue: nominalLightPalette
              }
            }
          };
        }
      },
      */

      // Example Rule 8 - Reduce the ranking of the "nominalPrimary" palette,
      // so that another palette gets chosen first instead.
      /*
      {
        select: {
          module: "pentaho/modules"
        },
        apply: {
          "pentaho/visual/color/palettes/nominalPrimary": {
            ranking: -1000
          }
        }
      },
      */

      // Example Rule 9 - Disable hierarchical dates strategy, to revert
      // to the old behavior (Before 8.1) that represents Time dimensions in a discrete axis.
      /*
      {
        select: {
          module: "pentaho/visual/role/adaptation/EntityWithTimeIntervalKeyStrategy"
        },
        apply: {
          isBrowsable: false
        }
      }
      */
    ]
  };
});
