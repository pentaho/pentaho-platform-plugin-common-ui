/*!
 * Copyright 2010 - 2015 Pentaho Corporation.  All rights reserved.
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
  "../abstract/View"
], function(def, AbstractChart) {

  "use strict";

  return AbstractChart.extend({
    _options: {
      orientation: "vertical"
    },

    _configure: function() {
      this.base();

      this._configureDisplayUnits();

      if(this._isAxisTitleVisible("base"))
        this._configureAxisTitle("base",  this._getBaseAxisTitle());

      if(this._isAxisTitleVisible("ortho"))
        this._configureAxisTitle("ortho", this._getOrthoAxisTitle());
    },

    _isAxisTitleVisible: def.fun.constant(true),

    _getOrthoAxisTitle: def.noop,

    _getBaseAxisTitle:  def.noop,

    _configureAxisTitle: function(axisType, title) {
      var unitsSuffix = this._cartesianAxesDisplayUnitsText[axisType];

      title = def.string.join(" - ", title, unitsSuffix);

      if(title) this.options[axisType + "AxisTitle"] = title;
    },

    /**
     * Builds a title composed of the label of the single attribute
     * of the role, or empty, if the role has more than one attribute.
     */
    _getMeasureRoleTitle: function(measureRole) {
      var ais = this._getAttributeInfosOfRole(measureRole);
      return (ais && ais.length === 1) ? ais[0].label : "";
    },

    _getDiscreteRolesTitle: function(roleNames) {
      var q = def.query(roleNames);

      if(this._multiRole) q = q.where(function(rn) { return rn !== this._multiRole; }, this);

      var labels = q.selectMany(function(rn) { return this._getAttributeInfosOfRole(rn); }, this)
          .distinct(function(ai) { return ai.name; })
          .select(function(ai) { return ai.label; })
          .where(def.truthy)
          .array();

      var last  = labels.pop(),
          first = labels.join(", ");
      if(first && last) {
        return this._message("chartAxisTitleMultipleDimText", [first, last]);
      }

      return first || last;
    },

    _configureAxisRange: function(primary, axisType) {
      var drawSpec = this._drawSpec,
          suffix = primary ? "" : "Secondary";

      if(drawSpec["autoRange" + suffix] !== "true") {
        var limit = drawSpec["valueAxisLowerLimit" + suffix];
        if(limit != null) {
          this.options[axisType + "AxisFixedMin"] = limit;
          this.options[axisType + "AxisOriginIsZero"] = false;
        }

        limit = drawSpec["valueAxisUpperLimit" + suffix];
        if(limit != null) this.options[axisType + "AxisFixedMax"] = limit;
      }
    },

    _cartesianAxesDisplayUnitsText: null,

    _configureDisplayUnits: function() {
      this._cartesianAxesDisplayUnitsText = {};
    },

    _configureAxisDisplayUnits: function(primary, axisType, allowFractional) {
      if(!allowFractional)
        this.options[axisType + "AxisTickExponentMin"] = 0; // 10^0 => 1

      var text,
          displayUnits = this._drawSpec["displayUnits" + (primary ? "" : "Secondary")],
          scaleFactor  = this._parseDisplayUnits(displayUnits);
      if(scaleFactor > 1) text = this._message("dlgChartOption_" + displayUnits);

      this._cartesianAxesDisplayUnitsText[axisType] = text || "";
    }
  });
});
