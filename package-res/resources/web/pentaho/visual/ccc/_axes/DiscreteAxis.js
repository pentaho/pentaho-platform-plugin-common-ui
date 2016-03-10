/*!
 * Copyright 2010 - 2015 Pentaho Corporation.  All rights reserved.
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
  "../util",
  "pentaho/data/filter"
], function(def, pvc, AbstractAxis, util, filter) {

  "use strict";

  return AbstractAxis.extend({
    _nonMultiGemFilter: function(gem) {
      return gem.role !== this.chart._multiRole;
    },

    _isNullMember: function(complex, gem) {
      var atom = complex.atoms[gem.cccDimName];
      return util.isNullMember(atom.value);
    },

    _buildGemHtmlTooltip: function(lines, complex, context, gem, index) {
      /*
       * Multi-chart formulas are not shown in the tooltip
       * They're on the small chart's title.
       *
       * Also, if the chart hides null members,
       * don't show them in the tooltip.
       * Using the scene's group, preferably, because the datum (here the complex) may have dimensions
       * that are null in the groups' own atoms.
       */
      if(this._nonMultiGemFilter(gem) &&
         !(this.chart._hideNullMembers && this._isNullMember(context.scene.group || complex, gem))) {
        this.base.apply(this, arguments);
      }
    },

    complexToFilter: function(complex) {
      var operands = [];

      this.getSelectionGems().each(function(gem) {
          var atom = complex.atoms[gem.cccDimName];
          var value = atom.value == null ? atom.rawValue : atom.value;

          if(value != null)
            operands.push(new filter.IsEqual(gem.name, value));

        });

      switch(operands.length) {
        case 0: return null;
        case 1: return operands[0];
      }
      return new filter.And(operands);
    },

    getSelectionGems: function() {
      return def.query(this.gems)
          .where(function(gem) { return !gem.isMeasureDiscrim; }, this);
    }
  });
});
