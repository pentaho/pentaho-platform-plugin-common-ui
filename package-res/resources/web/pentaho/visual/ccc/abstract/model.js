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
  "./types/colorSet",
  "./types/backgroundFill",
  "./types/fontStyle",
  "./types/sides",
  "./types/emptyCellMode",
  "./types/multiChartRangeScope",
  "./types/multiChartOverflow",
  "./types/sizeByNegativesMode",
  "./types/pattern",
  "./types/lineWidth",
  "./types/trendType",
  "./types/labelsOption",
  "./types/sliceOrder",
  "./themes"
], function(abstractModelFactory, bundle, colorFactory, colorSetFactory, backgroundFillFactory, fontStyleFactory,
    sidesFactory, emptyCellModeFactory, multiChartRangeScopeFactory, multiChartOverflowFactory,
    sizeByNegativesModeFactory, patternFactory, lineWidthFactory, trendTypeFactory, labelsOptionFactory,
    sliceOrderFactory) {

  "use strict";

  return function(context) {

    var Abstract = context.get(abstractModelFactory);

    return Abstract.extend({
      meta: {
        id: "pentaho/visual/ccc/abstract",
        "abstract": true,

        view: "View",
        styleClass: "",

        props: [
          //region Visual Roles
          {
            name: "rows",
            type: ["string"],
            isVisualRole: true,
            required: false
          },
          {
            name: "columns",
            type: ["string"],
            isVisualRole: true,
            required: false
          },
          {
            name: "measures",
            type: ["number"],
            isVisualRole: true,
            required: true
          },
          {
            name: "multi",
            type: ["string"],
            isVisualRole: true,
            required: false
          },
          //endregion

          //region background fill
          {
            name: "backgroundFill",
            type: backgroundFillFactory,
            required: true,
            value: "none"
          },
          {
            name: "backgroundColor",
            type: colorFactory,
            applicable: function() {
              return this.getv("backgroundFill") !== "none";
            },
            required: true
          },
          {
            name: "backgroundColorEnd",
            type: colorFactory,
            applicable: function() {
              return this.getv("backgroundFill") === "gradient";
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
            value: "plain"
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
            value: "right"
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
            value: "plain"
          },
          {
            name: "legendFontFamily",
            type: "string",
            applicable: function() { return this.getv("showLegend"); }
          },
          //endregion

          {
            name: "lineWidth",
            type: lineWidthFactory,
            required: true
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
            value: "global"
          },

          {
            name: "multiChartOverflow",
            type: multiChartOverflowFactory,
            required: true,
            value: "grow"
          },
          //endregion

          { // Line and Area only...
            name: "emptyCellMode",
            type: emptyCellModeFactory,
            required: true,
            value: "gap"
          },

          { // HG, Scatter
            name: "sizeByNegativesMode",
            type: sizeByNegativesModeFactory,
            required: true,
            value: "negLowest"
          },

          //region Pattern, Color Set and Reverse Colors

          //Used by Scatter and HeatGrid
          {
            id: "pattern",
            type: patternFactory,
            required: true
          },
          {
            id: "colorSet",
            type: colorSetFactory,
            required: true
          },
          {
            id: "reverseColors",
            type: "boolean",
            required: true
          },
          //endregion

          //region Trends
          {
            id: "trendName",
            type: "string",
            required: true
          },
          {
            id: "trendType",
            type: trendTypeFactory,
            required: true
          },
          {
            id: "trendLineWidth",
            type: lineWidthFactory,
            required: true
          },
          //endregion

          {
            id: "labelsOption",
            type: labelsOptionFactory
          },

          {
            name: "sliceOrder",
            type: sliceOrderFactory,
            required: true
          }

        ]
      }
      
    })
    .implement({meta: bundle.structured["abstract"]});
  };
});
