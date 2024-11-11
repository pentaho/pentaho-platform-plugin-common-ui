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
  "./Abstract",
  "./_util"
], function(module, BaseView, util) {

  "use strict";

  // "pentaho/visual/models/Pie"

  return BaseView.extend(module.id, {
    _cccClass: "PieChart",

    _roleToCccRole: {
      "columns": "multiChart",
      "rows": "category",
      "measures": "value"
    },

    _genericMeasureCccVisualRole: "value",
    _genericMeasureDiscrimCccVisualRole: "multiChart",

    _multiRole: "columns",

    _discreteColorRole: "rows",

    _tooltipHidePercentageOnPercentFields: true,

    _configureOptions: function() {

      this.base();

      if(this.options.valuesVisible) {
        this._configureValuesMask();
      }
    },

    _configureLabels: function() {

      this.base();

      if(this.options.valuesVisible) {
        this.options.valuesLabelStyle = this.model.labelsOption === "outside" ? "linked" : this.model.labelsOption;
      }
    },

    _configureLabelsAnchor: function() {
      // NOOP
    },

    _configureMultiChart: function() {

      this.base();

      this.options.legendSizeMax = "50%";
    },

    _configureValuesMask: function() {
      // Change values mask according to each category's
      // discriminated measure being isPercent or not
      if(this._isGenericMeasureMode) {
        var mappingFieldInfosByName = this._mappingFieldInfosByName;

        // e.g. sizeRole.dim
        var genericMeasureDiscrimName = this._genericMeasureDiscrimCccDimName;

        this.options.pie = {
          scenes: {
            category: {
              sliceLabelMask: function() {

                var meaasureMappingFieldInfoName = this.atoms[genericMeasureDiscrimName].value;

                if(mappingFieldInfosByName[meaasureMappingFieldInfoName].sourceIsPercent) {
                  // the value is the percentage itself;
                  return "{value}";
                }

                return "{value} ({value.percent})";
              }
            }
          }
        };
      } else {
        var measureMappingFieldInfo = this._getMappingFieldInfosOfRole("measures")[0];
        this.options.valuesMask = measureMappingFieldInfo.sourceIsPercent ? "{value}" : "{value} ({value.percent})";
      }
    },

    _getDiscreteColorMap: function() {
      var memberPalette = this._getMemberPalette();
      var colorMap;
      if(memberPalette) {
        var colorMappingFieldInfos =
            this._getMappingFieldInfosOfRole(this._discreteColorRole, /* excludeMeasureDiscrim: */true) || [];
        var C = colorMappingFieldInfos.length;
        // C >= 0 (color -> "rows" -> is optional)
        // When multiple measures exist, the pie chart shows them as multiple charts.
        // If measures would affect color, each small chart would have a single color.
        // => consider M = 0;
        // If C > 0, use the members' colors of the last color field.
        if(C > 0) {
          var mappingFieldInfo = colorMappingFieldInfos[C - 1];
          colorMap = util.copyColorMap(null, memberPalette[mappingFieldInfo.name]);
        }
      }

      return colorMap;
    }
  })
  .implement(module.config);
});
