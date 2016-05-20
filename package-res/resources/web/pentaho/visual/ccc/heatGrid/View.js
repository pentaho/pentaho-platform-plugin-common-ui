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
  "cdf/lib/CCC/def",
  "cdf/lib/CCC/cdo",
  "../cartesianAbstract/View"
], function(def, cdo, AbstractCartesianChart) {

  "use strict";

  return AbstractCartesianChart.extend({
    _cccClass: "HeatGridChart",

    _roleToCccDimGroup: {
      "columns": "series",
      "rows": "category",
      "color": "value",
      "size": "value2"
    },

    _options: {
      valuesVisible: false,
      useShapes: true,
      shape: "square",

      xAxisSize: 30,
      yAxisSize: 50,
      axisComposite: true,
      orthoAxisGrid: false, // clear inherited property

      //colorMissing:   "lightgray",
      colorScaleType: "linear",
      colorNormByCategory: false
    },

    _configure: function() {

      this.base();

      this.options.shape = this.model.shape;
    },

    _getColorScaleKind: function() {
      return "continuous";
    },

    _prepareLayout: function(options) {

      this.base(options);

      var measureCount = this._getRoleDepth("size") + this._getRoleDepth("color"),
          catsDepth = this._getRoleDepth("rows"),
          sersDepth = this._getRoleDepth("columns"),

          catsBreadth = Math.max(1,this._dataTable.getNumberOfRows() - 1),
          sersBreadth = this._dataTable.getNumberOfColumns() - catsDepth;

      if(measureCount > 0) sersBreadth /= measureCount;

      var width = options.width,
          height = options.height,
          currRatio = width / height,
          xyChartRatio = catsBreadth / sersBreadth;

      // Min desirable sizes according to depth
      var MAX_AXIS_SIZE = 300,
          MIN_LEVEL_HEIGHT = 70,
          MAX_LEVEL_HEIGHT = 200,
          MAX_AXIS_RATIO = 0.35;

      var minXAxisSize = Math.min(MAX_AXIS_SIZE, catsDepth * MIN_LEVEL_HEIGHT),
          minYAxisSize = Math.min(MAX_AXIS_SIZE, sersDepth * MIN_LEVEL_HEIGHT),
          maxXAxisSize = Math.min(MAX_AXIS_SIZE, catsDepth * MAX_LEVEL_HEIGHT, height * MAX_AXIS_RATIO),
          maxYAxisSize = Math.min(MAX_AXIS_SIZE, sersDepth * MAX_LEVEL_HEIGHT, width * MAX_AXIS_RATIO);

      var xAxisSize, yAxisSize;
      if(xyChartRatio > currRatio) { // lock width
        var extraHeight = height - width / xyChartRatio;

        yAxisSize = minYAxisSize;

        xAxisSize = Math.min(extraHeight, maxXAxisSize);
        xAxisSize = Math.max(xAxisSize, minXAxisSize);
      } else if(xyChartRatio < currRatio) { // lock height
        var extraWidth = width - height * xyChartRatio;

        xAxisSize = minXAxisSize;

        yAxisSize = Math.min(extraWidth, maxYAxisSize);
        yAxisSize = Math.max(yAxisSize, minYAxisSize);
      }

      // ------------------

      options.xAxisSize = xAxisSize;
      options.yAxisSize = yAxisSize;
    }

    // TODO: not true anymore...
    // Ortho axis title is not available on the server, so never show
    // _getOrthoAxisTitle: function(){
    // },

    // _getBaseAxisTitle: function(){
    // },

  });
});
