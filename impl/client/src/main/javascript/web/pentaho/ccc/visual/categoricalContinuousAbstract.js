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
  "pentaho/visual/models/categoricalContinuousAbstract",
  "./cartesianAbstract",
  "cdf/lib/CCC/def"
], function(module, modelFactory, baseViewFactory, def) {

  "use strict";

  return function(context) {

    var BaseView = context.get(baseViewFactory);

    return BaseView.extend({
      type: {
        id: module.id,
        props: {
          model: {type: modelFactory}
        }
      },

      _genericMeasureCccVisualRole: "value",

      _isAxisTitleVisible: function(type) {
        return !this._hasMultiChartColumns || type === "ortho";
      },

      _getOrthoAxisTitle: function() {
        var roleNames = def.getOwn(this._rolesByCccVisualRole, this._genericMeasureCccVisualRole);
        return roleNames ? this._getMeasureRoleTitle(roleNames[0]) : "";
      },

      _getBaseAxisTitle: function() {
        var roleNames = def.getOwn(this._rolesByCccVisualRole, "category");
        return roleNames ? this._getDiscreteRolesTitle(roleNames) : "";
      },

      _isBaseAxisQualitative: function() {
        var roleNames = def.getOwn(this._rolesByCccVisualRole, "category");
        return !!roleNames && this._isRoleQualitative(roleNames[0]);
      },

      _configureOptions: function() {

        this.base();

        this._configureAxisRange(/* isPrimary: */true, "ortho");

        var options = this.options;
        if(options.orientation === "vertical") {
          if(this._isBaseAxisQualitative()) {
            options.xAxisLabel_textAngle = -Math.PI / 4;
            options.xAxisLabel_textAlign = "right";
            options.xAxisLabel_textBaseline = "top";
          }
        } else {
          options.xAxisPosition = "top";
        }
      },

      _configureDisplayUnits: function() {
        this.base();

        this._configureAxisDisplayUnits(/* isPrimary: */true, "ortho");
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
      }
    });
  };
});
