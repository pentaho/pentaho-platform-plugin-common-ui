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
  "./AbstractAxis",
  "pentaho/i18n!../abstract/i18n/view"
], function(def, AbstractAxis) {

  "use strict";

  return AbstractAxis.extend({

    constructor: function(chart, axisId, gems) {

      this.base(chart, axisId, gems);

      /* There can be one special CCC dimension into which
       * the attributes of one or more measure roles are mapped.
       *
       * e.g.:
       *
       *   visual role  -> CCC dim group/name
       *   -----------------------------
       *   "measures"      "value"
       *   "measuresLine"  "value"
       *
       * Each of the visual roles may support more than one attribute.
       *
       * In the end, if more than one measure attribute is mapped to the same
       * CCC dimension group, either multiple CCC dimensions are created,
       * one for each of the attributes (e.g.: value, value2, value3...)
       * or a measure discriminator column is added to distinguish
       * which of the measure attributes is in the single CCC dimension (e.g.: "value").
       *
       * To activate the measure discriminator mode, a chart class has to specify the
       * prototype property `_genericMeasureCccDimName` with the name of the special CCC dimension.
       *
       * When multiple dimensions are created and multiple source roles exist,
       * the source roles are sorted alphabetically and the within role attribute order is preserved.
       */
    },

    defaultRole: "measures",

    _buildGemHtmlTooltip: function(lines, complex, context, gem/*, index*/) {
      /*
       * When using measure discriminator column,
       * only the "active" measure in "complex"
       * is placed in the tooltip.
       */
      var measureDiscrimGem = this.chart.measureDiscrimGem;
      if(measureDiscrimGem &&
         gem.isMeasureGeneric &&
         gem.name !== complex.atoms[measureDiscrimGem.cccDimName].value) {
        return;
      }

      // Obtain the dimension assigned to the role
      var cccDimName = gem.cccDimName, atom = complex.atoms[cccDimName];
      if(!atom.dimension.type.isHidden && (!complex.isTrend || atom.value != null)) {
        // ex: "GemLabel (RoleDesc): 200 (10%)"
        var tooltipLine = def.html.escape(gem.label);

        // Role description
        if(this.chart._noRoleInTooltipMeasureRoles[gem.role] !== true)
          tooltipLine += " (" + def.html.escape(gem.role) + ")";

        tooltipLine += ": " + def.html.escape(this._getAtomLabel(atom, context));

        if(!this.chart._tooltipHidePercentageForPercentGems || !gem.isPercent) {
          var valuePct = this._getAtomPercent(atom, context);
          if(valuePct != null)
            tooltipLine += " (" + def.html.escape("" + valuePct) + ")";
        }

        var suffix;

        // It can happen that the scene has more than one datum.
        // One is a null one and the other an interpolated one.
        // We may receive the null one in `complex` and
        // miss detecting that the scene is actually interpolated.
        if(context && context.scene) {
          var complexInterp = context.scene.datums()
              .where(function(d) {
                return d.isInterpolated && d.interpDimName === cccDimName;
              })
              .first();

          if(complexInterp)
            suffix = bundle.get("tooltip.dim.interpolation." + complexInterp.interpolation);

        } else if(complex.isTrend) {
          suffix = "(" + this.chart.options.trendLabel + ")";
          //bundle.get("tooltip.dim.interpolation." + complex.trendType);
        }

        if(suffix) tooltipLine += " " + suffix;

        lines.push(tooltipLine);
      }
    },

    _getAtomLabel: function(atom, context) {
      var group;
      if(context && (group = context.scene.group)) {
        var isMultiDatumGroup = group && group.count() > 1;
        if(isMultiDatumGroup) {
          var dim = group.dimensions(atom.dimension.name);
          return dim.format(dim.value({visible: true}));
        }
      }

      // Default, for scenes of single datums.
      return atom.label;
    },

    _getAtomPercent: function(atom, context) {
      if(context) {
        var cccChart = context.chart,
            data = cccChart.data,
            cccDimName = atom.dimension.name,
            visRoles = context.panel.visualRolesOf(cccDimName, /*includeChart*/true);

        if(visRoles && visRoles.some(function(r) { return r.isPercent; })) {
          var group = context.scene.group, dim = (group || data).dimensions(cccDimName),
              pct = group ? dim.percentOverParent({visible: true}) : dim.percent(atom.value);

          return dim.type.format().percent()(pct);
        }
      }
    }
  });

});
