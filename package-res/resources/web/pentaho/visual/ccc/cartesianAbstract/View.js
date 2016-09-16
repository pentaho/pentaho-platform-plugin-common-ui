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
  "../abstract/View",
  "pentaho/i18n!../abstract/i18n/view"
], function(def, AbstractChart, bundle) {

  "use strict";

  return AbstractChart.extend({
    _options: {
      orientation: "vertical"
    },

    _configure: function() {
      this.base();

      this._configureDisplayUnits();

      if(this._isAxisTitleVisible("base"))
        this._configureAxisTitle("base", this._getBaseAxisTitle());

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
      var maInfos = this._getMappingAttrInfosByRole(measureRole);
      return (maInfos && maInfos.length === 1) ? maInfos[0].label : "";
    },

    _getDiscreteRolesTitle: function(roleNames) {
      var q = def.query(roleNames);

      if(this._multiRole) q = q.where(function(rn) { return rn !== this._multiRole; }, this);

      var labels = q.selectMany(function(rn) { return this._getMappingAttrInfosByRole(rn); }, this)
          .distinct(function(maInfo) { return maInfo.name; })
          .select(function(maInfo) { return maInfo.label; })
          .where(def.truthy)
          .array();

      var last  = labels.pop(),
          first = labels.join(", ");
      if(first && last) {
        return bundle.get("axis.title.multipleDimText", [first, last]);
      }

      return first || last;
    },

    _configureAxisRange: function(primary, axisType) {
      var suffix = primary ? "" : "Secondary";

      if(!this.model.getv("autoRange" + suffix)) {
        var limit = this.model.getv("valueAxisLowerLimit" + suffix);
        if(limit != null) {
          this.options[axisType + "AxisFixedMin"] = limit;
          this.options[axisType + "AxisOriginIsZero"] = false;
        }

        limit = this.model.getv("valueAxisUpperLimit" + suffix);
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

      var propName = "displayUnits" + (primary ? "" : "Secondary"),
          displayUnitsElem = this.model.get(propName),
          displayUnitsType = this.model.type.get(propName).type,
          scaleFactor = displayUnitsType.scaleFactorOf(displayUnitsElem.value);

      this._cartesianAxesDisplayUnitsText[axisType] = scaleFactor > 1 ? displayUnitsElem.toString() : "";
    }
  });
});
