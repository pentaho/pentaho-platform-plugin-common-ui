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
  "../barAbstract/View",
  "../util"
], function(def, AbstractBarChart, util) {

  "use strict";

  return AbstractBarChart.extend({

    _roleToCccDimGroup: {
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
      plot2: true,

      secondAxisIndependentScale: false, // TODO: isn't this option CCC-V1 only?
      // prevent default of -1 (which means last series)
      secondAxisSeriesIndexes:    null // TODO: isn't this option CCC-V1 only?
    },

    _setNullInterpolationMode: function(options, value) {
      options.plot2NullInterpolationMode = value;
    },

    _initAxes: function() {
      this.base.apply(this, arguments);

      // Data part codes
      // 0 -> bars
      // 1 -> lines

      var calculation,
          measureDiscrimCccDimName = this.measureDiscrimGem && this.measureDiscrimGem.cccDimName;

      if(measureDiscrimCccDimName) {
        /*jshint laxbreak:true*/
        var barAttrInfos = this._getAttributeInfosOfRole("measures"),
            barAttrInfosByName = barAttrInfos
                ? def.query(barAttrInfos).uniqueIndex(function(ai) { return ai.name; })
                : {};

        calculation = function(datum, atoms) {
          var meaAttrName = datum.atoms[measureDiscrimCccDimName].value;
          atoms.dataPart = def.hasOwn(barAttrInfosByName, meaAttrName) ? "0" : "1";
        };
      } else if(this._genericMeasuresCount > 0) {
        // One measure of one of the roles exists.
        // And so, either it is always bar or always line...
        var constDataPart = this._getAttributeInfosOfRole("measures") ? "0" : "1";
        calculation = function(datum, atoms) { atoms.dataPart = constDataPart; };
      } else {
        throw def.error("At least one of the measure roles must be specified");
      }

      // Create the dataPart dimension calculation
      this.options.calculations.push({names: "dataPart", calculation: calculation});
    },

    _readUserOptions: function(options, drawSpec) {
      this.base(options, drawSpec);

      var shape = drawSpec.shape;
      if(shape && shape === "none") {
        options.pointDotsVisible = false;
      } else {
        options.pointDotsVisible = true;
        options.extensionPoints.pointDot_shape = shape;
      }
    },

    _configure: function() {
      this.base();

      this._configureAxisRange(/*isPrimary*/false, "ortho2");

      this._configureAxisTitle("ortho2", "");

      this.options.plot2OrthoAxis = 2;

      // Plot2 uses same color scale
      // options.plot2ColorAxis = 2;
      // options.color2AxisTransform = null;
    },

    _configureLabels: function(options, drawSpec) {
      this.base.apply(this, arguments);

      // Plot2
      var lineLabelsAnchor = drawSpec.lineLabelsOption;
      if(lineLabelsAnchor && lineLabelsAnchor !== "none") {
        options.plot2ValuesVisible = true;
        options.plot2ValuesAnchor = lineLabelsAnchor;
        options.plot2ValuesFont = util.defaultFont(util.readFontModel(this.model, "label"));
        options.extensionPoints.plot2Label_textStyle = this.model.getv("labelColor");
      }
    },

    _configureDisplayUnits: function() {
      this.base();

      this._configureAxisDisplayUnits(/*isPrimary*/false, "ortho2");
    }
  });
});
