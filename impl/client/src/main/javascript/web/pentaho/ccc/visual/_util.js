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
  "cdf/lib/CCC/def"
], function(def) {

  "use strict";

  // TODO: Analyzer specific
  // Null Members:  {v: "...[#null]", f: "Not Available"}
  // Null Values:   come as a null cell or null cell value ("-" report setting only affects the pivot table view).
  var _nullMemberRe = /\[#null\]$/;

  return {
    isNullMember: function(member) {
      return member == null || _nullMemberRe.test(member);
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
    getCccValueTypeOfField: function(field) {
      /* eslint default-case: 0 */
      switch(field.type) {
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
          return cccRole.isMeasureEffective && cccRole.isBoundDimensionName(cccGroup, dimName);
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
