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
define(function() {

  "use strict";

  return [
    "./abstract",
    "pentaho/visual/models/pie",
    function(BaseView, Model) {

      return BaseView.extend({
        $type: {
          props: {
            model: {valueType: Model}
          }
        },

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

        _tooltipHidePercentageOnPercentAttributes: true,

        _configureOptions: function() {

          this.base();

          if(this.options.valuesVisible) {
            this._configureValuesMask();
          }
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
            var attributeInfosByName = this.attributeInfosByName;

            // e.g. sizeRole.dim
            var genericMeasureDiscrimName = this._genericMeasureDiscrimCccDimName;

            this.options.pie = {
              scenes: {
                category: {
                  sliceLabelMask: function() {

                    var meaAttrName = this.atoms[genericMeasureDiscrimName].value;

                    if(attributeInfosByName[meaAttrName].isPercent) {
                      // the value is the percentage itself;
                      return "{value}";
                    }

                    return "{value} ({value.percent})";
                  }
                }
              }
            };
          } else {
            var meaAttrInfo = this._getAttributeInfosOfRole("measures")[0];
            this.options.valuesMask = meaAttrInfo.isPercent ? "{value}" : "{value} ({value.percent})";
          }
        },

        _getDiscreteColorMap: function() {
          var memberPalette = this._getMemberPalette();
          var colorMap;
          if(memberPalette) {
            var colorAttrInfos = this._getAttributeInfosOfRole(this._discreteColorRole, /* excludeMeasureDiscrim: */true) || [];
            var C = colorAttrInfos.length;
            // C >= 0 (color -> "rows" -> is optional)
            // When multiple measures exist, the pie chart shows them as multiple charts
            // and if these would affect color, each small chart would have a single color.
            // => consider M = 0;
            // If C, use the members' colors of the last color attribute.
            if(C) {
              var attrInfo = colorAttrInfos[C - 1];
              colorMap = this._copyColorMap(null, memberPalette[attrInfo.attr.name]);
            }
          }

          return colorMap;
        }
      });
    }
  ];
});
