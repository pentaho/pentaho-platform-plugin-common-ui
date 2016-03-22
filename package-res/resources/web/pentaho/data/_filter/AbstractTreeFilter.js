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
  "./AbstractFilter",
  "./_toSpec"
], function(AbstractFilter, _toSpec) {
  "use strict";

  /**
   * @name AbstractTreeFilter
   * @memberOf pentaho.data.filter
   *
   * @class
   * @extends pentaho.data.filter.AbstractFilter
   * @abstract
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

    /**
     * Inverts the operands in this filters.
     *
     * @return {pentaho.data.filter.AbstractFilter}
     * @private
     */
    _invertedOperands: function() {
      return this.operands.map(function(operand) {
        return operand.invert();
      });
    },

    /**
     * Returns a transformed version of this filter, walking the filter tree spawned by this node if need be.
     *
     * Coarsely, leaf nodes are transformed first using the `iteratee` function.
     * The outcome of those transformations is then successively
     * aggregated by their ancestors nodes, using the same `iteratee` function,
     * until the root node is eventually transformed.
     *
     * In filters that contain any other filters as operands,
     * (see e.g. {@link pentaho.data.filter.Or} or {@link pentaho.data.filter.And})
     * then the second argument of `iteratee` function is the list of operands transformed by the same `iteratee` function.
     * In other words, `iteratee` passed along to any descendant node, and the
     *
     * This method outputs the result of `iteratee` as long as it is a [filter]{@link pentaho.data.filter.AbstractFilter}.
     *
     * If `iteratee` returns an array, this method returns a new filter of this type
     * using the elements of that array as operands.
     * If the array is empty, this is interpreted as the intention of deleting this filter,
     * and `null` is returned instead.
     *
     * @param {?pentaho.data.filter~transformIteratee} iteratee - Function which will transform this filter.
     * @return {!pentaho.data.filter.AbstractFilter} Transformed filter.
     */
    visit: function(iteratee) {
      var operands = this.operands.reduce(function(memo, op) {
          if(op){
            var transformedOp = op.visit(iteratee);
            if(transformedOp)
              memo.push(transformedOp);
          }
          return memo;
        }, []);

      var output = iteratee(this, operands);

      if(output instanceof Array) {
        switch(output.length) {
          case 0: // prune this node
            return null;
          case 1: // no need to combine operands
            return output[0];
        }
        // build a version of this filter using the transformed operands
        var Filter = this.constructor;
        return new Filter(output);
      }

      return output;
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