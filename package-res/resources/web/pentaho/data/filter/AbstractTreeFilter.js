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
  "./AbstractFilter",
  "./_apply",
  "./_toSpec"
], function(AbstractFilter, _apply, _toSpec) {
  "use strict";

  /**
   * @name AbstractTreeFilter
   * @memberOf pentaho.data.filter
   * @class
   * @extends pentaho.data.filter.AbstractFilter
   * @abstract
   * @amd pentaho/data/filter/AbstractTreeFilter
   *
   * @classdesc A base class for filters that aggregate the outcome of other filters.
   *
   * Example subclasses include:
   *
   * * {@link pentaho.data.filter.And}
   * * {@link pentaho.data.filter.Or}
   *
   * @description Creates a filter that combines a series of filters.
   *
   * @param {!Array<pentaho.data.filter.AbstractFilter>} operands - The filters to aggregate.
   *
   */
  var AbstractTreeFilter = AbstractFilter.extend("pentaho.data.filter.AbstractTreeFilter", /** @lends pentaho.data.filter.AbstractTreeFilter# */{
    constructor: function(operands) {
      this.operands = (operands instanceof Array) ? operands.slice() : operands ? [operands] : [];
      Object.freeze(this);
    },

    /**
     * Gets the series of operands in this filter.
     * @type {pentaho.data.filter.AbstractFilter[]}
     * @readonly
     **/
    operands: null,

    _invertedOperands: function() {
      return this.operands.map(function(operand) {
        return operand.invert();
      });
    },

    /**
     * @inheritdoc
     */
    apply: function(datatable) {
      return _apply(this, datatable);
    },

    /**
     * @inheritdoc
     */
    toSpec: function() {
      var thisOperands = this.operands;
      var N = thisOperands.length;
      if(!N) return null;

      var operands = [];
      for(var k = 0; k < N; k++) {
        var spec = thisOperands[k].toSpec();
        if(spec)
          operands.push(spec);
      }
      return _toSpec(this._op, operands.length ? operands : null);
    }
  });

  return AbstractTreeFilter;

});