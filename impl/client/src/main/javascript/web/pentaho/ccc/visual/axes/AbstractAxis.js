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
  "pentaho/lang/Base",
  "cdf/lib/CCC/def",
  "../_util",
  "pentaho/i18n!../i18n/view"
], function(Base, def, util, bundle) {

  "use strict";

  return Base.extend({
    constructor: function(chart, axisId, mappingAttrInfos) {
      this.chart = chart;
      this.id = axisId;

      // TODO: revisit the need for boundRoles !!!!

      // Only bound roles will have an entry in this set
      this.boundRoles = {}; // roleId -> true

      /**
       * @type {MappingAttributeInfo[]}
       */
      this.mappingAttrInfos = mappingAttrInfos;

      this.depth = mappingAttrInfos.length;
      mappingAttrInfos.forEach(function(maInfo) {
        // Overwrite axis id with corresponding Axis instance
        maInfo.axis = this;

        this.boundRoles[maInfo.role] = true;
      }, this);
    },

    defaultRole: null,

    buildHtmlTooltip: function(lines, complex, context) {
      this.mappingAttrInfos.forEach(function(maInfo, index) {
        if(maInfo.cccDimName)
          this._buildMappingAttrInfoHtmlTooltip(lines, complex, context, maInfo, index);
      }, this);
    },

    _buildMappingAttrInfoHtmlTooltip: function(lines, complex, context, maInfo, index) {
      if (maInfo.isMeasureDiscrim || maInfo.attr.type === "number") {
        this._buildNumericMappingAttrInfoHtmlTooltip(lines, complex, context, maInfo, index);
      } else {

        /*
         * Multi-chart formulas are not shown in the tooltip
         * They're on the small chart's title.
         *
         * Also, if the chart hides null members,
         * don't show them in the tooltip.
         * Using the scene's group, preferably, because the datum (here the complex) may have dimensions
         * that are null in the groups' own atoms.
         */
        if (this._nonMultiMappingAttrInfoFilter(maInfo)) {
          var atom = complex.atoms[maInfo.cccDimName];
          if (atom.dimension.type.isHidden) return;

          var hideNullNumbers = this.chart._hideNullMembers;
          var isNullMember = this._isNullMember(context.scene.group || complex, maInfo);

          if (!(hideNullNumbers && isNullMember) &&
              (/* leaving this check to avoid breaking unexpected scenarios */!complex.isTrend || atom.value != null)) {

            // ex: "Line: Ships"
            lines.push(def.html.escape(maInfo.label) + ": " + def.html.escape(atom.label));
          }
        }

      }
    },


    _buildNumericMappingAttrInfoHtmlTooltip: function(lines, complex, context, maInfo/* , index*/) {
      /*
       * When using measure discriminator column,
       * only the "active" measure in "complex"
       * is placed in the tooltip.
       */
      if(this.chart._isGenericMeasureMode &&
        maInfo.isMeasureGeneric &&
        maInfo.attr.name !== complex.atoms[this.chart.GENERIC_MEASURE_DISCRIM_DIM_NAME].value) {
        return;
      }

      // Obtain the dimension assigned to the role
      var cccDimName = maInfo.cccDimName;
      var atom = complex.atoms[cccDimName];
      if(!atom.dimension.type.isHidden && (!complex.isTrend || atom.value != null)) {
        // ex: "MaiLabel (RoleDesc): 200 (10%)"
        var tooltipLine = def.html.escape(maInfo.label);

        // Role description
        if(this.chart._noRoleInTooltipMeasureRoles[maInfo.role] !== true)
          tooltipLine += " (" + def.html.escape(maInfo.role) + ")";

        tooltipLine += ": " + def.html.escape(this._getAtomLabel(atom, context));

        if(!this.chart._tooltipHidePercentageOnPercentAttributes || !maInfo.isPercent) {
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
          // bundle.get("tooltip.dim.interpolation." + complex.trendType);
        }

        if(suffix) tooltipLine += " " + suffix;

        lines.push(tooltipLine);
      }
    },

    _nonMultiMappingAttrInfoFilter: function(maInfo) {
      return maInfo.role !== this.chart._multiRole;
    },

    _isNullMember: function(complex, maInfo) {
      var atom = complex.atoms[maInfo.cccDimName];
      return util.isNullMember(atom.value);
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
        var cccChart = context.chart;
        var data = cccChart.data;
        var cccDimName = atom.dimension.name;
        var visRoles = context.panel.visualRolesOf(cccDimName, /* includeChart: */true);

        if(visRoles && visRoles.some(function(r) { return r.isPercent; })) {
          var group = context.scene.group;
          var dim = (group || data).dimensions(cccDimName);
          var pct = group ? dim.percentOverParent({visible: true}) : dim.percent(atom.value);

          return dim.type.format().percent()(pct);
        }
      }
    },

    complexToFilter: function() {
      throw new Error("Not Implemented");
    }
  });

});
