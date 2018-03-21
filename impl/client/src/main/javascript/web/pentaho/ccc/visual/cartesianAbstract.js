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
  "./_util",
  "cdf/lib/CCC/def",
  "pentaho/i18n!./i18n/view"
], function(util, def, bundle) {

  "use strict";

  return [
    "./abstract",
    "pentaho/visual/models/cartesianAbstract",
    function(BaseView, Model) {

      return BaseView.extend({
        $type: {
          props: {
            model: {valueType: Model}
          }
        },

        _options: {
          orientation: "vertical"
        },

        _configureOptions: function() {

          this.base();

          var options = this.options;
          var model = this.model;

          // Axis Tick and Title Labels
          var value = model.labelColor;
          if(value != null) {
            options.axisLabel_textStyle = options.axisTitleLabel_textStyle = value;
          }

          value = model.labelSize;
          if(value) {
            options.axisTitleFont = options.axisFont = this._labelFont;
          } else {
            options.axisTitleFont = options.axisFont = util.defaultFont(null, 12);
          }

          // ---

          this._configureDisplayUnits();

          if(this._isAxisTitleVisible("base"))
            this._configureAxisTitle("base", this._getBaseAxisTitle());

          if(this._isAxisTitleVisible("ortho"))
            this._configureAxisTitle("ortho", this._getOrthoAxisTitle());
        },

        _isAxisTitleVisible: def.fun.constant(true),

        _getOrthoAxisTitle: def.noop,

        _getBaseAxisTitle: def.noop,

        _configureAxisTitle: function(axisType, title) {
          var unitsSuffix = this._cartesianAxesDisplayUnitsText[axisType];

          title = def.string.join(" - ", title, unitsSuffix);

          if(title) this.options[axisType + "AxisTitle"] = title;
        },

        /*
         * Builds a title composed of the label of the single field
         * of the role, or empty, if the role has more than one field.
         */
        _getMeasureRoleTitle: function(measureRole) {
          var mappingFieldInfos = this._getMappingFieldInfosOfRole(measureRole);
          return (mappingFieldInfos && mappingFieldInfos.length === 1) ? mappingFieldInfos[0].label : "";
        },

        _getDiscreteRolesTitle: function(roleNames) {

          var queryRoleNames = def.query(roleNames);

          if(this._multiRole) {
            queryRoleNames = queryRoleNames.where(function(rn) {
              return rn !== this._multiRole;
            }, this);
          }

          var labels = queryRoleNames
              .selectMany(function(rn) {
                return this._getMappingFieldInfosOfRole(rn);
              }, this)
              .distinct(function(mappingFieldInfo) {
                return mappingFieldInfo.name;
              })
              .select(function(mappingFieldInfo) {
                return mappingFieldInfo.label;
              })
              .where(def.truthy)
              .array();

          var last = labels.pop();
          var first = labels.join(", ");
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

        _configureAxisDisplayUnits: function(primary, axisType) {

          var propName = "displayUnits" + (primary ? "" : "Secondary");
          var displayUnits = this.model.getv(propName);
          var displayUnitsType = this.model.$type.get(propName).valueType;
          var scaleFactor = displayUnitsType.scaleFactorOf(displayUnits);

          // Unfortunately the stored element value usually has no formatted value associated,
          // so that we need to read it from the corresponding domain element.
          this._cartesianAxesDisplayUnitsText[axisType] = scaleFactor > 1
            ? displayUnitsType.domain.get(displayUnits).toString()
            : "";
        }
      });
    }
  ];
});
