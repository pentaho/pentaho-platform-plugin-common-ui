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
  "pentaho/lang/Base",
  "cdf/lib/CCC/def"
], function(Base, def) {

  "use strict";

  return Base.extend({
    constructor: function(chart, axisId, gems) {
      this.chart = chart;
      this.id = axisId;

      // TODO: revisit the need for boundRoles !!!!

      // Only bound roles will have an entry in this set
      this.boundRoles = {}; // roleId -> true

      this.gems = gems;
      this.depth = gems.length;
      gems.forEach(function(gem) {
        // Overwrite axis id with corresponding Axis instance
        gem.axis = this;

        this.boundRoles[gem.role] = true;
      }, this);
    },

    defaultRole: null,

    buildHtmlTooltip: function(lines, complex, context) {
     this.gems.forEach(function(gem, index) {
       if(gem.cccDimName) this._buildGemHtmlTooltip(lines, complex, context, gem, index);
     }, this);
    },

    _buildGemHtmlTooltip: function(lines, complex, context, gem, index) {
     // Multi-chart formulas are not shown in the tooltip.
     // They're on the small chart's title.
     if(gem.role !== this.chart._multiRole) {
       var atom = complex.atoms[gem.cccDimName];
       if(!atom.dimension.type.isHidden && (!complex.isTrend || atom.value != null)) {
         // ex: "Line: Ships"
         lines.push(def.html.escape(gem.label) + ": " + def.html.escape(atom.label));
       }
     }
    },

    complexToFilter: function() {
      throw new Error("Not Implemented");
    }
  });

});
