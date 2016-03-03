/*!
 * Copyright 2010 - 2016 Pentaho Corporation.  All rights reserved.
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
  "./And",
  "./Or"
], function(And, Or) {
  "use strict";

  return /** @lends pentaho.data.filter.And# */{

    /**
     * Returns the intersection between this filter and any number of other filters.
     * Intersections of intersections of filters (ANDs of ANDs) are flattened.
     *
     * @param {...pentaho.data.filter.AbstractFilter} filters - One or more filters to be added to the intersection operation.
     * @return {!pentaho.data.filter.And} A filter that is the intersection of this filter with a series of other filters.
     * @override
     */
    and: function() {
      var N = arguments.length;
      if(!N) return this;

      var operands = this.operands.slice();
      for(var k = 0; k < N; k++) {
        operands.push(arguments[k]);
      }
      return operands.length === 1 ? operands[0] : new And(operands);
    },

    /**
     * @inheritdoc
     */
    invert: function() {
      return new Or(this._invertedOperands());
    }

  };

});