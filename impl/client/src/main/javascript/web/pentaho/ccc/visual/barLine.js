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
  "pentaho/visual/models/barLine",
  "./barAbstract",
  "cdf/lib/CCC/def",
  "./_util"
], function(module, modelFactory, baseViewFactory, def, util) {

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

      _roleToCccRole: {
        "columns": "series",
        "rows": "category",
        "multi": "multiChart",
        "measures": "value",
        "measuresLine": "value" // NOTE: maps to same dim group as "measures" role!
      },

      _noRoleInTooltipMeasureRoles: {
        "measures": true,
        "measuresLine": true
      },

      _options: {
        plot2: true
      },

      _setNullInterpolationMode: function(options, value) {
        options.plot2NullInterpolationMode = value;
      },

      _initAxes: function() {
        this.base.apply(this, arguments);

        // Data part codes
        // 0 -> bars
        // 1 -> lines

        var calculation;
        if(this._isGenericMeasureMode) {
          /* jshint laxbreak:true*/
          var barAttrInfos = this._getMappingAttrInfosByRole("measures");
          var barAttrsByName = barAttrInfos
              ? def.query(barAttrInfos).uniqueIndex(function(maInfo) {
                return maInfo.attr.name;
              })
              : {};
          var measureDiscrimCccDimName = this.GENERIC_MEASURE_DISCRIM_DIM_NAME;

          calculation = function(datum, atoms) {
            var meaAttrName = datum.atoms[measureDiscrimCccDimName].value;
            atoms.dataPart = def.hasOwn(barAttrsByName, meaAttrName) ? "0" : "1";
          };
        } else if(this._genericMeasuresCount > 0) {
          // One measure of one of the roles exists.
          // And so, either it is always bar or always line...
          var constDataPart = this._getMappingAttrInfosByRole("measures") ? "0" : "1";
          calculation = function(datum, atoms) {
            atoms.dataPart = constDataPart;
          };
        } else {
          throw def.error("At least one of the measure roles must be specified");
        }

        // Create the dataPart dimension calculation
        this.options.calculations.push({names: "dataPart", calculation: calculation});
      },

      _readUserOptions: function(options) {

        this.base.apply(this, arguments);

        var shape = this.model.shape;
        if(shape && shape === "none") {
          options.pointDotsVisible = false;
        } else {
          options.pointDotsVisible = true;
          options.pointDot_shape = shape;
        }
      },

      _configureOptions: function() {

        this.base();

        this._configureAxisRange(/* isPrimary: */false, "ortho2");

        this._configureAxisTitle("ortho2", "");

        this.options.plot2OrthoAxis = 2;

        // Plot2 uses same color scale
        // options.plot2ColorAxis = 2;
        // options.color2AxisTransform = null;
      },

      _configureLabels: function(options, model) {
        this.base.apply(this, arguments);

        // Plot2
        var lineLabelsAnchor = model.lineLabelsOption;
        if(lineLabelsAnchor && lineLabelsAnchor !== "none") {
          options.plot2ValuesVisible = true;
          options.plot2ValuesAnchor = lineLabelsAnchor;
          options.plot2ValuesFont = util.defaultFont(util.readFontModel(model, "label"));

          var labelColor = model.labelColor;
          if(labelColor != null) {
            options.plot2Label_textStyle = labelColor;
          }
        }
      },

      _configureDisplayUnits: function() {
        this.base();

        this._configureAxisDisplayUnits(/* isPrimary: */false, "ortho2");
      }
    });
  };
});
