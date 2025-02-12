/*! ******************************************************************************
 *
 * Pentaho
 *
 * Copyright (C) 2024 by Hitachi Vantara, LLC : http://www.pentaho.com
 *
 * Use of this software is governed by the Business Source License included
 * in the LICENSE.TXT file.
 *
 * Change Date: 2029-07-20
 ******************************************************************************/

define([
  "pentaho/module!_",
  "./Abstract",
  "pentaho/visual/util",
  "cdf/lib/CCC/def",
  "pentaho/i18n!./i18n/view"
], function(module, BaseView, util, def, bundle) {

  "use strict";

  // "pentaho/visual/models/CartesianAbstract"

  return BaseView.extend(module.id, {
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
        options.axisTitleFont = options.axisFont = util.getDefaultFont(null, 12);
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

    _configureAxisTickUnits: function(axisType, roleName) {
      var mappingFieldInfos = this._getMappingFieldInfosOfRole(roleName);

      if(mappingFieldInfos != null &&
         mappingFieldInfos.length === 1 &&
         mappingFieldInfos[0].sourceTimeIntervalDuration != null) {

        var sourceTimeIntervalDuration = mappingFieldInfos[0].sourceTimeIntervalDuration;
        if(sourceTimeIntervalDuration === "halfYear") {
          sourceTimeIntervalDuration = "6m";
        } else if(sourceTimeIntervalDuration === "quarter") {
          sourceTimeIntervalDuration = "3m";
        }

        this.options[axisType + "AxisTickUnitMin"] = sourceTimeIntervalDuration;
      }
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
  })
  .implement(module.config);
});
