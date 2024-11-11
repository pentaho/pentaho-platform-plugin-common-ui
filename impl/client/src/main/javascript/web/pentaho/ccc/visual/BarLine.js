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
  "./BarAbstract",
  "cdf/lib/CCC/def"
], function(module, BaseView, def) {

  "use strict";

  // "pentaho/visual/models/BarLine"

  return BaseView.extend(module.id, {
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

    _setNullInterpolationMode: function(value) {
      this.options.plot2NullInterpolationMode = value;
    },

    /**
     * Configure CCC `visualRoles`.
     *
     * @override
     * @protected
     */
    _configureCccVisualRoles: function() {

      var cccMainRoleSpecs = this.options.visualRoles;
      var cccPlot2RoleSpecs = null;

      this.plot2 = this.model.measuresLine.hasFields;
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

      // MappingFieldInfos is filled above, in visual role mapping attribute order.
      // This enables its use for configuring the CCC visual roles.
      this._mappingFieldInfos.forEach(function(mappingFieldInfo) {
        var cccRoleSpecs;
        if(mappingFieldInfo.roleName === "measuresLine") {
          // Plot2 visual role.
          cccRoleSpecs = cccPlot2RoleSpecs;
        } else {
          cccRoleSpecs = cccMainRoleSpecs;
        }

        var cccRoleSpec = def.lazy(cccRoleSpecs, mappingFieldInfo.cccRoleName);

        def.array.lazy(cccRoleSpec, "dimensions").push(mappingFieldInfo.name);
      });
    },

    _configureOptions: function() {

      this.base();

      var options = this.options;

      var shape = this.model.shape;
      if(shape && shape === "none") {
        options.pointDotsVisible = false;
      } else {
        options.pointDotsVisible = true;
        options.pointDot_shape = shape;
      }

      this._configureAxisRange(/* isPrimary: */false, "ortho2");

      this._configureAxisTitle("ortho2", "");
    },

    _configureLabels: function() {

      this.base();

      var model = this.model;

      // Plot2
      var lineLabelsAnchor = model.lineLabelsOption;
      if(lineLabelsAnchor && lineLabelsAnchor !== "none") {

        var options = this.options;

        options.plot2ValuesVisible = true;
        options.plot2ValuesAnchor = lineLabelsAnchor;
        options.plot2ValuesFont = this._labelFont;

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
  })
  .implement(module.config);
});
