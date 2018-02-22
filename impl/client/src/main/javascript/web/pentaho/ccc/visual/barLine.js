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
  "cdf/lib/CCC/def",
  "./_util"
], function(def, util) {

  "use strict";

  return [
    "./barAbstract",
    "pentaho/visual/models/barLine",
    function(BaseView, Model) {

      return BaseView.extend({
        $type: {
          props: {
            model: {valueType: Model}
          }
        },

        _roleToCccRole: {
          "columns": "series",
          "rows": "category",
          "multi": "multiChart",
          "measures": "value",
          "measuresLine": "value" // NOTE: maps to same CCC visual role as the "measures" role!
        },

        _noRoleInTooltipMeasureRoles: {
          "measures": true,
          "measuresLine": true
        },

        _options: {
          plot2OrthoAxis: 2,

          // Ensure that the ortho2 axis is positioned at the right,
          // even when no ortho1 axis exists (happens when "measures" is not mapped).
          ortho2AxisPosition: "right",

          // Plot2 uses the same color scale as that of the main plot.
          plot2ColorAxis: 1
          // options.color2AxisTransform = null;
        },

        _setNullInterpolationMode: function(options, value) {
          options.plot2NullInterpolationMode = value;
        },

        /**
         * Configure CCC `visualRoles`.
         *
         * @param {MappingFieldInfo[]} attrInfos - The array of mapping attribute info objects.
         * @override
         * @protected
         */
        _configureCccVisualRoles: function(attrInfos) {

          var cccMainRoleSpecs = this.options.visualRoles;
          var cccPlot2RoleSpecs = null;

          this.plot2 = this.model.measuresLine.isMapped;
          if(this.plot2) {
            // Creating this here prevents changing a shared nested object.
            this.options.plots = [
              {
                name: "plot2",
                visualRoles: {}
              }
            ];

            cccPlot2RoleSpecs = this.options.plots[0].visualRoles;
          } else {
            this.options.plots = null;
          }

          // MappingAttrInfos is filled above, in visual role mapping attribute order.
          // This enables its use for configuring the CCC visual roles.
          attrInfos.forEach(function(attrInfo) {
            var cccRoleSpecs;
            if(attrInfo.role === "measuresLine") {
              // Plot2 visual role.
              cccRoleSpecs = cccPlot2RoleSpecs;
            } else {
              cccRoleSpecs = cccMainRoleSpecs;
            }

            var cccRoleSpec = def.lazy(cccRoleSpecs, attrInfo.cccRole);

            def.array.lazy(cccRoleSpec, "dimensions").push(attrInfo.name);
          });
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
    }
  ];
});
