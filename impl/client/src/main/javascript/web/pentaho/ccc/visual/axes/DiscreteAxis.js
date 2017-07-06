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
  "cdf/lib/CCC/def",
  "cdf/lib/CCC/pvc",
  "./AbstractAxis",
  "../_util",
  "pentaho/data/filter/isEqual"
], function(def, pvc, AbstractAxis, util, isEqualFactory) {

  "use strict";

  return AbstractAxis.extend({
    _nonMultiMappingAttrInfoFilter: function(maInfo) {
      return maInfo.role !== this.chart._multiRole;
    },

    _isNullMember: function(complex, maInfo) {
      var atom = complex.atoms[maInfo.cccDimName];
      return util.isNullMember(atom.value);
    },

    _buildMappingAttrInfoHtmlTooltip: function(lines, complex, context, maInfo, index) {
      /*
       * Multi-chart formulas are not shown in the tooltip
       * They're on the small chart's title.
       *
       * Also, if the chart hides null members,
       * don't show them in the tooltip.
       * Using the scene's group, preferably, because the datum (here the complex) may have dimensions
       * that are null in the groups' own atoms.
       */
      if(this._nonMultiMappingAttrInfoFilter(maInfo) &&
         !(this.chart._hideNullMembers && this._isNullMember(context.scene.group || complex, maInfo))) {
        this.base.apply(this, arguments);
      }
    },

    complexToFilter: function(complex) {
      var filter = null;

      var context = this.chart.type.context;
      var IsEqual;

      this.getSelectionMappingAttrInfos().each(function(maInfo) {
        var atom = complex.atoms[maInfo.cccDimName];
        var value = atom.value == null ? atom.rawValue : atom.value;

        if(value != null) {
          if(!IsEqual) IsEqual = context.get(isEqualFactory);

          var operand = new IsEqual({property: maInfo.attr.name, value: {_: "string", v: value, f: atom.label}});
          filter = filter ? filter.and(operand) : operand;
        }
      });

      return filter;
    },

    getSelectionMappingAttrInfos: function() {
      return def.query(this.mappingAttrInfos)
          .where(function(maInfo) { return !maInfo.isMeasureDiscrim; }, this);
    }
  });
});
