/*!
 * Copyright 2010 - 2016 Pentaho Corporation. All rights reserved.
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
define([
  "pentaho/visual/base/modelFactory",
  "pentaho/i18n!./i18n/model",
  "./types/color",
  "./types/fontStyle",
  "./types/sides",
  "./types/emptyCellMode",
  "./types/multiChartRangeScope",
  "./types/sizeByNegativesMode",
  "./theme/model"
], function(visualFactory, bundle, colorFactory, fontStyleFactory, sidesFactory, emptyCellModeFactory,
    multiChartRangeScopeFactory, sizeByNegativesModeFactory) {

  "use strict";

  return function(context) {

    var Visual = context.get(visualFactory);

    return Visual.extend({
      meta: {
        id: "pentaho/visual/ccc/abstract",
        abstract: true,
        view: "View",
        styleClass: "",

        props: [
          //region visual roles (Old data reqs)
          {
            name: "rows",
            type: ["string"],
            required: false
          },
          {
            name: "columns",
            type: ["string"],
            required: false
          },
          {
            name: "measures",
            type: ["number"],
            required: true
          },
          {
            name: "multi",
            type: ["string"],
            required: false
          },
          //endregion

          //region background fill
          {
            name: "backgroundFill",
            type: {
              base: "refinement",
              of:   "string",
              facets: ["DiscreteDomain"],
              domain: ["NONE", "SOLID", "GRADIENT"]
            },
            required: true,
            value: "NONE"
          },
          {
            name: "backgroundColor",
            type: colorFactory,
            applicable: function() {
              return this.getv("backgroundFill") !== "NONE";
            },
            required: true
          },
          {
            name: "backgroundColorEnd",
            type: colorFactory,
            applicable: function() {
              return this.getv("backgroundFill") === "GRADIENT";
            },
            required: true
          },
          //endregion

          //region Cartesian Axis Tick Label and Title Label

          // For multi-charts, Size and Family also used for chart title font
          {
            name: "labelColor",
            type: colorFactory
          },
          {
            name: "labelSize",
            type: "number"
          },
          {
            name: "labelStyle",
            type: fontStyleFactory,
            required: true,
            value: "PLAIN"
          },
          {
            name: "labelFontFamily",
            type: "string"
          },
          //endregion

          //region Legend
          {
            name: "showLegend",
            type: "boolean",
            value: true
          },

          {
            name: "legendPosition",
            type: sidesFactory,
            applicable: function() { return this.getv("showLegend"); },
            required: true,
            value: "RIGHT"
          },

          {
            name: "legendBackgroundColor",
            type: colorFactory,
            applicable: function() { return this.getv("showLegend"); }
          },

          // Legend Item Label Font
          {
            name: "legendColor",
            type: colorFactory,
            applicable: function() { return this.getv("showLegend"); }
          },

          {
            name: "legendSize",
            type: "number",
            applicable: function() { return this.getv("showLegend"); }
          },
          {
            name: "legendStyle",
            type: fontStyleFactory,
            applicable: function() { return this.getv("showLegend"); },
            required: true,
            value: "PLAIN"
          },
          {
            name: "legendFontFamily",
            type: "string",
            applicable: function() { return this.getv("showLegend"); }
          },
          //endregion

          {
            name: "lineWidth",
            type: {
              base: "refinement",
              of:   "number",
              facets: ["DiscreteDomain"],
              domain: [1, 2, 3, 4, 5, 6, 7, 8]
            }
          },

          //region Multi-Chart
          {
            name: "maxChartsPerRow",
            type: {
              base: "refinement",
              of:   "number",
              facets: ["DiscreteDomain"],
              domain: [1, 2, 3, 4, 5]
            }
          },

          {
            name: "multiChartRangeScope",
            type: multiChartRangeScopeFactory,
            required: true,
            value: "GLOBAL"
          },
          //endregion

          { // Line and Area only...
            name: "emptyCellMode",
            type: emptyCellModeFactory,
            required: true,
            value: "GAP"
          },

          { // HG, Scatter
            name: "sizeByNegativesMode",
            type: sizeByNegativesModeFactory,
            required: true,
            value: "NEG_LOWEST"
          }
        ]
      }
      
    })
    .implement({meta: bundle.structured["abstract"]});
  };
});
