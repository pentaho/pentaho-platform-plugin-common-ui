/*!
 * Copyright 2010 - 2018 Hitachi Vantara. All rights reserved.
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
  "pentaho/module!",
  "./CartesianAbstract",
  "pentaho/visual/models/HeatGrid",
  "cdf/lib/CCC/def"
], function(module, BaseView, Model, def) {

  "use strict";

  return BaseView.extend({
    $type: {
      id: module.id,
      props: {
        model: {valueType: Model}
      }
    },

    _cccClass: "HeatGridChart",

    _roleToCccRole: {
      "columns": "series",
      "rows": "category",
      "color": "color",
      "size": "size"
    },

    // HG does not support multi-charting.
    _multiRole: null,

    _configureOptions: function() {

      this.base();

      this.options.shape = this.model.shape;
    },

    _getColorScaleKind: function() {
      return "continuous";
    },

    _prepareLayout: function() {

      this.base();

      var xAxisSize;
      var yAxisSize;
      var options = this.options;

      options.axisTitleSize = def.get(this._validExtensionOptions, "axisTitleSize", 0);
      options.axisComposite = def.get(this._validExtensionOptions, "axisComposite", options.axisComposite);

      if(options.axisComposite) {
        var model = this.model;
        var measureCount = model.size.fields.count + model.color.fields.count;
        var catsDepth = model.rows.fields.count;
        var sersDepth = model.columns.fields.count;

        // Need CCC auto-layout for the composite axis.
        // TODO: Analyzer CrossTable Layout specific
        var dataTable = this.model.data;
        if(dataTable.originalCrossTable) {
          dataTable = dataTable.originalCrossTable;
        }

        // TODO: These calculations only really apply to CrossTab...
        var catsBreadth = Math.max(1, dataTable.getNumberOfRows() - 1);
        var sersBreadth = dataTable.getNumberOfColumns() - catsDepth;

        if(measureCount > 0) {
          sersBreadth /= measureCount;
        }

        var width = Math.max(0, options.width - options.axisTitleSize);
        var height = Math.max(0, options.height - options.axisTitleSize);
        var currRatio = width / height;
        var xyChartRatio = catsBreadth / sersBreadth;

        // Min desirable sizes according to depth
        var MAX_AXIS_SIZE = 300;
        var MIN_LEVEL_HEIGHT = 70;
        var MAX_LEVEL_HEIGHT = 200;
        var MAX_AXIS_RATIO = 0.35;

        var minXAxisSize = Math.min(MAX_AXIS_SIZE, catsDepth * MIN_LEVEL_HEIGHT);
        var minYAxisSize = Math.min(MAX_AXIS_SIZE, sersDepth * MIN_LEVEL_HEIGHT);
        var maxXAxisSize = Math.min(MAX_AXIS_SIZE, catsDepth * MAX_LEVEL_HEIGHT, height * MAX_AXIS_RATIO);
        var maxYAxisSize = Math.min(MAX_AXIS_SIZE, sersDepth * MAX_LEVEL_HEIGHT, width * MAX_AXIS_RATIO);

        if(xyChartRatio > currRatio) { // Lock width
          var extraHeight = height - width / xyChartRatio;

          yAxisSize = minYAxisSize;

          xAxisSize = Math.min(extraHeight, maxXAxisSize);
          xAxisSize = Math.max(xAxisSize, minXAxisSize);
        } else if(xyChartRatio < currRatio) { // Lock height
          var extraWidth = width - height * xyChartRatio;

          xAxisSize = minXAxisSize;

          yAxisSize = Math.min(extraWidth, maxYAxisSize);
          yAxisSize = Math.max(yAxisSize, minYAxisSize);
        }
      } else {
        xAxisSize = yAxisSize = null;
      }

      options.xAxisSize = xAxisSize;
      options.yAxisSize = yAxisSize;
    },

    _createChart: function(ChartClass) {

      var chart = this.base(ChartClass);

      var visualElemsCountMax = this._getVisualElementsCountMax();
      if(visualElemsCountMax > 0) {
        var me = this;
        chart.override("_onWillCreatePlotPanelScene", function(plotPanel, data, axisSeriesDatas, axisCategDatas) {
          var S = axisSeriesDatas.length;
          var C = axisCategDatas.length;
          var visualElemsCount = S * C;
          me._validateVisualElementsCount(visualElemsCount, visualElemsCountMax);
        });
      }

      return chart;
    },

    _getBaseAxisTitle: function() {
      var roleNames = this._getRolesMappedToCccRole("category");
      return roleNames && roleNames.length > 0 ? this._getDiscreteRolesTitle(roleNames) : "";
    },

    _getOrthoAxisTitle: function() {
      var roleNames = this._getRolesMappedToCccRole("series");
      return roleNames && roleNames.length > 0 ? this._getDiscreteRolesTitle(roleNames) : "";
    }
  })
  .configure({$type: module.config});
});
