/*! ******************************************************************************
 *
 * Pentaho
 *
 * Copyright (C) 2024 by Hitachi Vantara, LLC : http://www.pentaho.com
 *
 * Use of this software is governed by the Business Source License included
 * in the LICENSE.TXT file.
 *
 * Change Date: 2028-08-13
 ******************************************************************************/

define([
  "pentaho/module!_",
  "./CartesianAbstract"
], function(module, BaseView) {

  "use strict";
  // "pentaho/visual/models/CategoricalContinuousAbstract"

  return BaseView.extend(module.id, {
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

    _isBaseAxisCategorical: function() {
      var roleNames = this._getRolesMappedToCccRole("category");
      return !!roleNames && roleNames.length > 0 && this._isRoleCategorical(roleNames[0]);
    },

    _configureOptions: function() {

      this.base();

      this._configureAxisRange(/* isPrimary: */true, "ortho");

      var options = this.options;
      if(options.orientation === "vertical") {
        if(this._isBaseAxisCategorical()) {
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

      this._configureAxisTickUnits("base", "rows");
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
    }
  })
  .implement(module.config);
});
