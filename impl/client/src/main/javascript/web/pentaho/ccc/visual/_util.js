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
  "cdf/lib/CCC/def",
  "cdf/lib/CCC/protovis"
], function(def, pv) {

  "use strict";

  // TODO: Analyzer specific
  // Null Members:  {v: "...[#null]", f: "Not Available"}
  // Null Values:   come as a null cell or null cell value ("-" report setting only affects the pivot table view).
  var _nullMemberRe = /\[#null\]$/;

  return {
    isNullMember: function(member) {
      return member == null || _nullMemberRe.test(member);
    },

    copyColorMap: function(mapOut, mapIn) {
      if(mapIn) {
        if(!mapOut) mapOut = {};
        for(var key in mapIn) // tolerates nully
          if(def.hasOwn(mapIn, key))
            mapOut[key] = pv.color(mapIn[key]);
      }
      return mapOut;
    },

    defaultFont: function(font, defaultSize) {
      if(!font) return (defaultSize || 10) + "px OpenSansRegular, sans-serif";

      // TODO: Analyzer specific
      return font.replace(/\bdefault\s*$/i, "OpenSansRegular, sans-serif");
    },

    readFontModel: function(model, prefix) {
      var size = model.getv(prefix + "Size");
      if(size) {
        var style = model.getv(prefix + "Style");
        if(style == null || style === "plain")
          style = "";
        else
          style += " ";

        return style + size + "px " + model.getv(prefix + "FontFamily");
      }
    },

    getFilterClauseCount: function(filter) {
      if(filter) {
        filter = filter.toDnf();
        if(filter.kind === "or") {
          return filter.operands.count;
        }
      }
      // undefined
    },

    // region CCC helpers
    getCccValueTypeOfFieldType: function(fieldType) {
      /* eslint default-case: 0 */
      switch(fieldType) {
        case "string": return String;
        case "number": return Number;
        case "date": return Date;
      }
      return null; // any
    },

    getCccContextActiveVisualRolesOfMeasureDimension: function(cccContext, dimName) {
      var cccScene = cccContext.scene;

      // Only want measure visual roles, which only exist at the plot-level.
      var cccRoles = cccScene.panel().visualRolesOf(dimName);
      if(cccRoles !== null) {

        // Scatter chart has one scene per datum, not group...
        // On the other hand, discrete cartesian axes may have multiple groups per scene.
        // cccScene.data() gets the closest ancestor common data.
        var cccGroup = cccScene.group && cccScene.groups.length === 1
            ? cccScene.group
            : cccScene.data();

        cccRoles = cccRoles.filter(function(cccRole) {
          // NOTE: `dimName` is assumed to belong to the measure axis, so,
          // it doesn't really matter if it's really seen as a measure or not for CCC.
          // CCC's isMeasureEffective is mixed with using a discrete or continuous scale.
          return !cccRole.isMeasureEffective || cccRole.isBoundDimensionName(cccGroup, dimName);
        });

        if(cccRoles.length === 0) {
          cccRoles = null;
        }
      }

      return cccRoles;
    },

    getCccContextInterpolationLabelOfDimension: function(cccContext, dimName) {

      // It can happen that the scene has more than one datum.
      // One is a null one and the other an interpolated one.
      // We may receive the null one in `complex` and
      // miss detecting that the scene is actually interpolated.

      var cccInterpolatedDatum = cccContext.scene.datums()
          .where(function(d) {
            return d.isInterpolated && d.interpDimName === dimName;
          })
          .first();

      return cccInterpolatedDatum ? cccInterpolatedDatum.interpolation : null;
    },

    getCccContextAtomLabel: function(cccContext, cccAtom) {
      var cccGroup;
      if(cccContext && (cccGroup = cccContext.scene.group)) {
        var isMultiDatumGroup = cccGroup && cccGroup.count() > 1;
        if(isMultiDatumGroup) {
          var cccDim = cccGroup.dimensions(cccAtom.dimension.name);
          return cccDim.format(cccDim.value({visible: true}));
        }
      }

      // Default, for scenes of single datums.
      return cccAtom.label;
    },

    findCccContextPercentRoleLabel: function(cccContext, cccRoles) {

      var cccScene = cccContext.scene;

      var percentVar = def.query(cccRoles)
          .select(function(cccRole) {
            if(cccRole.isPercent) {
              var sceneVar = cccScene.vars[cccRole.name];
              if(sceneVar && sceneVar.percent != null) {
                return sceneVar.percent;
              }
            }
          })
          .first();

      return percentVar != null ? percentVar.label : null;
    }
    // endregion
  };
});
