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
  "../abstract/View"
], function(def, AbstractChart) {

  "use strict";

  return AbstractChart.extend({
    _cccClass: "PieChart",

    _roleToCccRole: {
      "columns": "multiChart",
      "rows": "category",
      "measures": "value"
    },

    _genericMeasureCccVisualRole: "value",

    _multiRole: "columns",

    _discreteColorRole: "rows",

    _tooltipHidePercentageOnPercentAttributes: true,

    _options: {
      legendShape: "circle",
      titlePosition: "bottom",
      slice_strokeStyle: "white",
      slice_lineWidth: 0.8,
      valuesAnchor: "outer"
    },

    _configure: function() {
      this.base();

      if(this.options.valuesVisible) this._configureValuesMask();
    },

    _isLegendVisible: function() {
      return this._getRoleDepth("rows") > 0;
    },

    _configureLabels: function(options, model) {
      this.base.apply(this, arguments);

      if(options.valuesVisible) {
        options.valuesLabelStyle = model.labelsOption === "outside" ? "linked" : model.labelsOption;
      }
    },

    _configureLabelsAnchor: function(options, model) {
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
        var mappingAttrInfoByName = this._mappingAttrInfoByName;
        var genericMeasureDiscrimName = this.GENERIC_MEASURE_DISCRIM_DIM_NAME;

        this.options.pie = {
          scenes: {
            category: {
              sliceLabelMask: function() {
                var meaAtom = this.atoms[genericMeasureDiscrimName];
                var meaMAInfoId;
                var meaMAInfo;
                if(meaAtom && (meaMAInfoId = meaAtom.value) &&
                   (meaMAInfo = mappingAttrInfoByName[meaMAInfoId]) && meaMAInfo.isPercent) {
                  return "{value}"; // the value is the percentage itself;
                }

                return "{value} ({value.percent})";
              }
            }
          }
        };
      }
    },

    _getDiscreteColorMap: function() {
      var memberPalette = this._getMemberPalette();
      if(memberPalette) {
        var colorMAInfos = this._getDiscreteColorMappingAttrInfos();
        var C = colorMAInfos.length;
        // C >= 0 (color -> "rows" -> is optional)
        // When multiple measures exist, the pie chart shows them as multiple charts
        // and if these would affect color, each small chart would have a single color.
        // => consider M = 0;
        // If C, use the members' colors of the last color attribute.
        if(C) return this._copyColorMap(null, memberPalette[colorMAInfos[C - 1].name]);
      }
    }
  });
});
