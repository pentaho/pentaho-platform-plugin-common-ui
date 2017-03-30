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
  "pentaho/visual/models/pie",
  "./abstract"
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

      _configureOptions: function() {

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
          var genericMeasureAttrsByName = this._selectGenericMeasureMappingAttrInfos()
              .uniqueIndex(function(maInfo) {
                return maInfo.attr.name;
              });

          var genericMeasureDiscrimName = this.GENERIC_MEASURE_DISCRIM_DIM_NAME;

          this.options.pie = {
            scenes: {
              category: {
                sliceLabelMask: function() {
                  var meaAtom = this.atoms[genericMeasureDiscrimName];
                  var meaMAName;
                  var meaMAInfo;
                  if(meaAtom && (meaMAName = meaAtom.value) &&
                      (meaMAInfo = genericMeasureAttrsByName[meaMAName]) && meaMAInfo.isPercent) {
                    return "{value}"; // the value is the percentage itself;
                  }

                  return "{value} ({value.percent})";
                }
              }
            }
          };
        } else {
          var meaMAInfo = this._getMappingAttrInfosByRole("measures")[0];
          this.options.valuesMask = meaMAInfo.isPercent ? "{value}" : "{value} ({value.percent})";
        }
      },

      _getDiscreteColorMap: function() {
        var memberPalette = this._getMemberPalette();
        var colorMap;
        if(memberPalette) {
          var colorMAInfos = this._getDiscreteColorMappingAttrInfos();
          var C = colorMAInfos.length;
          // C >= 0 (color -> "rows" -> is optional)
          // When multiple measures exist, the pie chart shows them as multiple charts
          // and if these would affect color, each small chart would have a single color.
          // => consider M = 0;
          // If C, use the members' colors of the last color attribute.
          if(C) {
            var maInfo = colorMAInfos[C - 1];
            if(maInfo && maInfo.attr) {
              colorMap = this._copyColorMap(null, memberPalette[maInfo.attr.name]);
            }
          }
        }

        return colorMap;
      }
    });
  };
});
