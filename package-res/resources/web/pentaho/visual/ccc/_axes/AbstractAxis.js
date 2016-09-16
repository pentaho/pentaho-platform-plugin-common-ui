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
      // Multi-chart formulas are not shown in the tooltip.
      // They're on the small chart's title.
      if(maInfo.role !== this.chart._multiRole) {
        var atom = complex.atoms[maInfo.cccDimName];
        if(!atom.dimension.type.isHidden && (!complex.isTrend || atom.value != null)) {
          // ex: "Line: Ships"
          lines.push(def.html.escape(maInfo.label) + ": " + def.html.escape(atom.label));
        }
      }
    },

    complexToFilter: function() {
      throw new Error("Not Implemented");
    }
  });

});
