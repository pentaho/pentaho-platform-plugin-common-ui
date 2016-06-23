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
  "../cartesianAbstract/View"
], function(def, AbstractCartesianChart) {

  "use strict";

  return AbstractCartesianChart.extend({
    _genericMeasureCccDimName: "value",

    _options: {
      panelSizeRatio: 0.8
    },

    _isAxisTitleVisible: function(type) {
      return !this._hasMultiChartColumns || type === "ortho";
    },

    _getOrthoAxisTitle: function() {
      var roleNames = def.getOwn(this._getRolesByCccDimGroup(), this._genericMeasureCccDimName);
      return roleNames ? this._getMeasureRoleTitle(roleNames[0]) : "";
    },

    _getBaseAxisTitle: function() {
      var roleNames = this._getRolesByCccDimGroup()["category"];
      return roleNames ? this._getDiscreteRolesTitle(roleNames) : "";
    },

    _configure: function() {
      this.base();

      this._configureAxisRange(/*isPrimary*/true, "ortho");

      var options = this.options;
      if(options.orientation === "vertical") {
        options.xAxisLabel_textAngle    = -Math.PI/4;
        options.xAxisLabel_textAlign    = "right";
        options.xAxisLabel_textBaseline = "top";
      } else {
        options.xAxisPosition = "top";
      }
    },

    _configureDisplayUnits: function() {
      this.base();

      this._configureAxisDisplayUnits(/*isPrimary*/true, "ortho");
    }
  });
});
