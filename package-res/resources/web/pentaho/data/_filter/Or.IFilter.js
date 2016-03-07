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
  "./Or",
  "./And"
], function(Or, And) {
  "use strict";

  return /** @lends pentaho.data.filter.Or# */{

    /**
     * Gets the union between this filter and any number of other filters.
     * Unions of unions of filters (ORs of ORs) are flattened.
     *
     * @param {...pentaho.data.filter.AbstractFilter} filter - A filter to be added to the union operation.
     * @return {!pentaho.data.filter.Or} A filter that is the union of this filter with a series of other filters.
     * @override
     */
    or: function() {
      var N = arguments.length;
      if(!N) return this;
      var operands = this.operands.slice();
      for(var k = 0; k < N; k++) {
        operands.push(arguments[k]);
      }
      return operands.length === 1 ? operands[0] : new Or(operands);
    },

    /**
     * @inheritdoc
     */
    invert: function() {
      return new And(this._invertedOperands());
    }
  };

});