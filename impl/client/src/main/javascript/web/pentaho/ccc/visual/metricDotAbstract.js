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
  "pentaho/visual/models/metricDotAbstract",
  "./cartesianAbstract",
  "./_trends"
], function(module, modelFactory, baseViewFactory) {

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

      _cccClass: "MetricDotChart",

      _supportsTrends: true,

      _options: {
        axisGrid: true,
        autoPaddingByDotSize: false
      },

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

      _isColorDiscrete: function() {
        if(this.model.color.isMapped) return this._isRoleQualitative("color");
      },

      _getColorScaleKind: function() {
        var isDiscrete = this._isColorDiscrete();
        return isDiscrete == null ? undefined  :
               isDiscrete         ? "discrete" : "continuous";
      },

      _configureOptions: function() {

        this.base();

        this._configureAxisRange(/* isPrimary: */true, "base");
        this._configureAxisRange(/* isPrimary: */false, "ortho");
      },

      _isLegendVisible: function() {
        // Prevent default behavior that hides the legend when there are no series.
        // Hide the legend even if there is only one "series".
        // TODO: this is not the proper way to do this cause it's tied to Analyzer's data format...
        return this._isColorDiscrete() === true &&
            this._dataTable.isCrossTable &&
            this._dataTable.implem.cols.length > 1;
      },

      _getOrthoAxisTitle: function() {
        return this._getMeasureRoleTitle("y");
      },

      _getBaseAxisTitle: function() {
        return this._getMeasureRoleTitle("x");
      },

      _configureDisplayUnits: function() {

        this.base();

        this._configureAxisDisplayUnits(/* isPrimary: */true,  "base",  /* allowFractional: */true);
        this._configureAxisDisplayUnits(/* isPrimary: */false, "ortho", /* allowFractional: */true);
      }
    });
  };
});
