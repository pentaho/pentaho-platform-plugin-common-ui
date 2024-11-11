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
  "./CartesianAbstract",
  "./_trends"
], function(module, BaseView) {

  "use strict";

  // "pentaho/visual/models/MetricPointAbstract"

  return BaseView.extend(module.id, {
    _cccClass: "MetricDotChart",

    _supportsTrends: true,

    /* Override Default map */
    _roleToCccRole: {
      "multi": "multiChart",
      "rows": "category",
      "x": "x",
      "y": "y",
      "color": "color"
    },

    _discreteColorRole: "color",

    // Roles already in the axis' titles
    _noRoleInTooltipMeasureRoles: {
      "x": true,
      "y": true,
      "measures": false
    },

    _getColorScaleKind: function() {
      var isCategorical = this._isColorCategorical();
      return isCategorical == null ? undefined :
        isCategorical ? "discrete" : "continuous";
    },

    _configureOptions: function() {

      this.base();

      this._configureAxisRange(/* isPrimary: */true, "base");
      this._configureAxisRange(/* isPrimary: */false, "ortho");
    },

    _shouldShowLegend: function() {
      // Add to default behavior, that hides the legend when there are no series.
      // Hide the legend even if there is only one "series".
      var isLegendVisible = this.base();
      if(!isLegendVisible) {
        return false;
      }

      // Need CCC legendItemCountMin...
      // TODO: this is not the proper way to do this cause it's tied to Analyzer's data format...
      var dataTable = this.model.data;
      if(dataTable.originalCrossTable) {
        dataTable = dataTable.originalCrossTable;
      }

      return !dataTable.isCrossTable || dataTable.implem.cols.length > 1;
    },

    _getOrthoAxisTitle: function() {
      return this._getMeasureRoleTitle("y");
    },

    _getBaseAxisTitle: function() {
      return this._getMeasureRoleTitle("x");
    },

    _configureDisplayUnits: function() {

      this.base();

      this._configureAxisDisplayUnits(/* isPrimary: */true, "base");
      this._configureAxisDisplayUnits(/* isPrimary: */false, "ortho");

      this._configureAxisTickUnits("base", "x");
      this._configureAxisTickUnits("ortho", "y");
    }
  })
  .implement(module.config);
});
