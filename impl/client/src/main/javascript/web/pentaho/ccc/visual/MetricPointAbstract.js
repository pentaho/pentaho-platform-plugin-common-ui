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
  "pentaho/module!_",
  "./CartesianAbstract",
  "pentaho/visual/models/MetricPointAbstract",
  "pentaho/data/util",
  "pentaho/util/logger",
  "./_trends"
], function(module, BaseView, Model, dataUtil, logger) {

  "use strict";

  return BaseView.extend({
    $type: {
      id: module.id,
      props: {
        model: {valueType: Model}
      }
    },

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
    },

    /**
     * Calls base plus it configures a CCC `where` condition which have a null "x" or "y" visual role value.
     *
     * A CCC `where` filter is used so that the series/color atoms order is captured.
     *
     * TODO: This is a temporary solution.
     * Ideally, visual role definitions would specify an attribute such as `allowsNullData`,
     * defaulting to `true`, and the data would be filtered out a priori.
     *
     * @protected
     * @override
     */
    _initData: function() {

      this.base();

      // X and Y are both required and continuous.
      var xCccDimName = this._getMappingFieldInfosOfRole("x")[0].name;
      var yCccDimName = this._getMappingFieldInfosOfRole("y")[0].name;

      this._options.dataWhere = function(datum) {
        return datum.atoms[xCccDimName].value !== null && datum.atoms[yCccDimName].value !== null;
      };
    }
  })
  .configure({$type: module.config});
});
