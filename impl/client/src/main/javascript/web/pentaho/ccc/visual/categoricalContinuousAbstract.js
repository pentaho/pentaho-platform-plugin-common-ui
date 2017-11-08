/*!
 * Copyright 2010 - 2017 Hitachi Vantara. All rights reserved.
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
  "cdf/lib/CCC/def"
], function(def) {

  "use strict";

  return [
    "./cartesianAbstract",
    "pentaho/visual/models/categoricalContinuousAbstract",
    function(BaseView, Model) {

      return BaseView.extend({
        $type: {
          props: {
            model: {valueType: Model}
          }
        },

        _genericMeasureCccVisualRole: "value",
        _genericMeasureDiscrimCccVisualRole: "series",

        _isAxisTitleVisible: function(type) {
          return !this._isMultiChartMode || type === "ortho";
        },

        _getOrthoAxisTitle: function() {
          var roleNames = this._getRolesMappedToCccRole(this._genericMeasureCccVisualRole);
          return roleNames && roleNames.length > 0 ? this._getMeasureRoleTitle(roleNames[0]) : "";
        },

        _getBaseAxisTitle: function() {
          var roleNames = this._getRolesMappedToCccRole("category");
          return roleNames && roleNames.length > 0 ? this._getDiscreteRolesTitle(roleNames) : "";
        },

        _isBaseAxisQualitative: function() {
          var roleNames = this._getRolesMappedToCccRole("category");
          return !!roleNames && roleNames.length > 0 && this._isRoleQualitative(roleNames[0]);
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
    }
  ];
});
