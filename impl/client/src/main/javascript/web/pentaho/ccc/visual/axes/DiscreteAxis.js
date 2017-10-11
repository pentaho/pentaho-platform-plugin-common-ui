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
  "cdf/lib/CCC/def",
  "cdf/lib/CCC/pvc",
  "./AbstractAxis"
], function(def, pvc, AbstractAxis) {

  "use strict";

  return AbstractAxis.extend({
    complexToFilter: function(complex) {
      var filter = null;

      var context = this.chart.$type.context;
      var IsEqual;

      this.getSelectionMappingAttrInfos().each(function(maInfo) {

        var atom = complex.getSpecifiedAtom(maInfo.cccDimName);
        if(atom) {
          if(!IsEqual) IsEqual = context.get("=");

          var value = atom.value === null ? atom.rawValue : atom.value;

          var attrType = maInfo.attr.type;
          var valueType = attrType;

          var operand = new IsEqual({
            property: maInfo.attr.name,
            value: value === null ? null : {_: valueType, v: value, f: atom.label}
          });

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
