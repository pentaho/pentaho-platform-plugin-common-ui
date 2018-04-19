/*!
 * Copyright 2017 Hitachi Vantara. All rights reserved.
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
   * 1. PDI Data Inspection - "pentaho-det"
   * 2. Pentaho Analyzer - "pentaho-analyzer"
   * 3. Pentaho Analyzer in Dashboards - "pentaho-dashboards"
   * 4. Pentaho CDF/CDE - "pentaho-cdf"
   *
   * Hitachi Vantara stock visualizations' model ids:
   * 1. Pie - "pentaho/visual/models/areaStacked"
   * 2. Column - "pentaho/visual/models/bar"
   * 3. Bar - "pentaho/visual/models/barHorizontal"
   * 4. Stacked Column - "pentaho/visual/models/barStacked"
   * 5. Stacked Bar - "pentaho/visual/models/barStackedHorizontal"
   * 6. 100% Stacked Column - "pentaho/visual/models/barNormalized"
   * 7. 100% Stacked Bar - "pentaho/visual/models/barNormalizedHorizontal"
   * 8. Column-Line Combo - "pentaho/visual/models/barLine"
   * 9. Scatter - "pentaho/visual/models/scatter"
   * 10. Bubble - "pentaho/visual/models/bubble"
   * 11. Pie - "pentaho/visual/models/pie"
   * 12. Donut - "pentaho/visual/models/donut"
   * 13. Sunburst - "pentaho/visual/models/sunburst"
   * 14. Heat Grid - "pentaho/visual/models/heatGrid"
   * 15. Geo Map - "pentaho/visual/models/geoMap"
   *
   * Hitachi Vantara stock visualizations' view ids:
   * 1. Pie - "pentaho/ccc/visual/areaStacked"
   * 2. Column - "pentaho/ccc/visual/bar"
   * 3. Bar - "pentaho/ccc/visual/barHorizontal"  Normalized
   * 4. Stacked Column - "pentaho/ccc/visual/barStacked"
   * 5. Stacked Bar - "pentaho/ccc/visual/barStackedHorizontal"
   * 6. 100% Stacked Column - "pentaho/ccc/visual/barNormalized"
   * 7. 100% Stacked Bar - "pentaho/ccc/visual/barNormalizedHorizontal"
   * 8. Column-Line Combo - "pentaho/ccc/visual/barLine"
   * 9. Scatter - "pentaho/ccc/visual/scatter"
   * 10. Bubble - "pentaho/ccc/visual/bubble"
   * 11. Pie - "pentaho/ccc/visual/pie"
   * 12. Donut - "pentaho/ccc/visual/donut"
   * 13. Sunburst - "pentaho/ccc/visual/sunburst"
   * 14. Heat Grid - "pentaho/ccc/visual/heatGrid"
   * 15. Geo Map - "pentaho/geo/visual/map"
   *
   * Sample visualization model ids:
   * 1. Calculator - "pentaho/visual/samples/calc/model"
   *
   * Hitachi Vantara stock color palettes' ids:
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
          type: "pentaho/visual/models/pie"
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
          type: "pentaho/visual/models/barNormalizedHorizontal"
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
            "pentaho/visual/models/line",
            "pentaho/visual/models/barLine"
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
          type: "pentaho/ccc/visual/donut"
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
          instance: "pentaho/visual/color/palettes/nominalPrimary"
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
          type: "pentaho/visual/models/bar"
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
          type: "pentaho/visual/models/bar"
        },
        apply: {
          props: {
            palette: {
              defaultValue: {
                $instance: {id: "pentaho/visual/color/palettes/nominalLight"}
              }
            }
          }
        }
      },
      */

      // Example Rule 8 - Reduce the ranking of the "nominalPrimary" palette,
      // so that another palette gets chosen first instead.
      /*
      {
        select: {
          type: "pentaho/type/Context"
        },
        apply: {
          instances: {
            "pentaho/visual/color/palettes/nominalPrimary": {ranking: -1000}
          }
        }
      },
      */

      // Example Rule 9 - Disable hierarchical dates strategy, to revert
      // to the old behavior (Before 8.1) that represents Time dimensions in a discrete axis.
      /*
      {
        select: {
          type: "pentaho/visual/role/adaptation/entityWithTimeIntervalKeyStrategy"
        },
        apply: {
          isBrowsable: false
        }
      }
      */
    ]
  };
});
