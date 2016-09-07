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
    constructor: function(chart, axisId, mais) {
      this.chart = chart;
      this.id = axisId;

      // TODO: revisit the need for boundRoles !!!!

      // Only bound roles will have an entry in this set
      this.boundRoles = {}; // roleId -> true

      /**
       * @type {MappingAttributeInfo[]}
       */
      this.mais = mais;

      this.depth = mais.length;
      mais.forEach(function(mai) {
        // Overwrite axis id with corresponding Axis instance
        mai.axis = this;

        this.boundRoles[mai.role] = true;
      }, this);
    },

    defaultRole: null,

    buildHtmlTooltip: function(lines, complex, context) {
      this.mais.forEach(function(mai, index) {
        if(mai.cccDimName)
          this._buildMaiHtmlTooltip(lines, complex, context, mai, index);
      }, this);
    },

    _buildMaiHtmlTooltip: function(lines, complex, context, mai, index) {
      // Multi-chart formulas are not shown in the tooltip.
      // They're on the small chart's title.
      if(mai.role !== this.chart._multiRole) {
        var atom = complex.atoms[mai.cccDimName];
        if(!atom.dimension.type.isHidden && (!complex.isTrend || atom.value != null)) {
          // ex: "Line: Ships"
          lines.push(def.html.escape(mai.label) + ": " + def.html.escape(atom.label));
        }
      }
    },

    complexToFilter: function() {
      throw new Error("Not Implemented");
    }
  });

});
