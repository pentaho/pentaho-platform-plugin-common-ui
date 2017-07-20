/*!
 * Copyright 2010 - 2017 Pentaho Corporation. All rights reserved.
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
  "module",
  "pentaho/visual/models/heatGrid",
  "./cartesianAbstract",
  "cdf/lib/CCC/def"
], function(module, modelFactory, baseViewFactory, def) {

  "use strict";

  return function(context) {

    var BaseView = context.get(baseViewFactory);

    return BaseView.extend({
      $type: {
        id: module.id,
        props: {
          model: {valueType: modelFactory}
        }
      },

      _cccClass: "HeatGridChart",

      _roleToCccRole: {
        "columns": "series",
        "rows": "category",
        "color": "color",
        "size": "size"
      },

      _configureOptions: function() {

        this.base();

        this.options.shape = this.model.shape;
      },

      _getColorScaleKind: function() {
        return "continuous";
      },

      _prepareLayout: function(options) {

        this.base(options);

        var xAxisSize;
        var yAxisSize;

        options.axisTitleSize = def.get(this._validExtensionOptions, "axisTitleSize", 0);
        options.axisComposite = def.get(this._validExtensionOptions, "axisComposite", options.axisComposite);

        if(options.axisComposite) {
          var measureCount = this._getRoleDepth("size") + this._getRoleDepth("color");
          var catsDepth = this._getRoleDepth("rows");
          var sersDepth = this._getRoleDepth("columns");
          var catsBreadth = Math.max(1, this._dataTable.getNumberOfRows() - 1);
          var sersBreadth = this._dataTable.getNumberOfColumns() - catsDepth;

          if(measureCount > 0) sersBreadth /= measureCount;

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
        } else {
          xAxisSize = yAxisSize = null;
        }

        options.xAxisSize = xAxisSize;
        options.yAxisSize = yAxisSize;
      },

      _createChart: function(ChartClass, options) {

        var chart = this.base(ChartClass, options);

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
        var roleNames = def.getOwn(this._rolesByCccVisualRole, "category");
        return roleNames ? this._getDiscreteRolesTitle(roleNames) : "";
      },

      _getOrthoAxisTitle: function() {
        var roleNames = def.getOwn(this._rolesByCccVisualRole, "series");
        return roleNames ? this._getDiscreteRolesTitle(roleNames) : "";
      }
    });
  };
});
