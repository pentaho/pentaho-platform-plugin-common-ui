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
   * @name Not
   * @memberOf pentaho.data.filter
   *
   * @class
   * @extends pentaho.data.filter.AbstractFilter
   *
   * @classdesc A filter that implements the boolean inversion of another filter.
   *
   * @example
   * <caption> Create a new <code>Not</code> filter.</caption>
   *
   * require(["pentaho/data/Table", "pentaho/data/filter"], function(Table, filter) {
   *   var data = new Table({
   *     model: [
   *       {name: "product", type: "string",  label: "Product"},
   *       {name: "sales",   type: "number",  label: "Sales"},
   *       {name: "inStock", type: "boolean", label: "In Stock"}
   *     ],
   *     rows: [
   *       {c: [{v: "A"}, {v: 12000}, {v: true}]},
   *       {c: [{v: "B"}, {v: 6000},  {v: true}]},
   *       {c: [{v: "C"}, {v: 12000}, {v: false}]},
   *       {c: [{v: "D"}, {v: 1000},  {v: false}]},
   *       {c: [{v: "E"}, {v: 2000},  {v: false}]},
   *       {c: [{v: "F"}, {v: 3000},  {v: false}]},
   *       {c: [{v: "G"}, {v: 4000},  {v: false}]}
   *     ]
   *   });
   *
   *  var sales12k = new filter.IsEqual("sales", 12000);
   *  var filter = new Not(sales12k);
   *
   *   var filteredData = myFilter.apply(data);
   *   //filteredData.getValue(0, 0) === "B"
   *   //filteredData.getValue(1, 0) === "D"
   *   //filteredData.getValue(2, 0) === "E"
   *   //filteredData.getValue(3, 0) === "F"
   *   //filteredData.getValue(4, 0) === "G"
   *
   * });
   *
   *
   * @description Creates a `Not` filter given another filter
   * (an instance of a descendant of {@link pentaho.data.filter.AbstractFilter}).
   *
   * @param {!pentaho.data.filter.AbstractFilter} operand - The filter to be inverted.
   */
  var NotFilter = AbstractFilter.extend("pentaho.data.filter.Not", /** @lends pentaho.data.filter.Not# */{

    constructor: function(operand) {
      this.operand = operand;
      Object.freeze(this);
    },

    /**
     * Gets the operand of this filter.
     *
     * @name operand
     * @memberOf pentaho.data.filter.Not#
     * @type {pentaho.data.filter.AbstractFilter}
     * @readonly
     **/

    /**
     * @inheritdoc
     */
    get type() { return "not"; },

    _op: "$not",

    /**
     * @inheritdoc
     */
    contains: function(element) {
      return !this.operand.contains(element);
    },

    /**
     * Returns a transformed version of this filter.
     *
     * This method outputs the result of `iteratee` as long as it is a [filter]{@link pentaho.data.filter.AbstractFilter}.
     * If `iteratee` returns an array, then:
     * - if the array has at least one element, this method returns a filter that inverts the first element
     * - if the array is empty, this is interpreted as the intention of deleting this filter, and `null` is returned
     *
     * @param {pentaho.data.filter~transformIteratee} iteratee - Function which will transform this filter.
     * @return {pentaho.data.filter.AbstractFilter} Transformed filter.
     */
    visit: function(iteratee){
      var operand = this.operand.visit(iteratee);
      var output = iteratee(this, [operand]);
      if (output instanceof Array){
        return output.length ? output[0].invert(): null;
      }
      return output;
    },

    /**
     * Return the inverse of this filter.
     * Double inversion is prevented:  {@link ...#operand} is returned.
     *
     * @return {pentaho.data.filter.AbstractFilter} A filter that is the inverse of this filter.
     * @override
     */
    invert: function() {
      return this.operand;
    },

    /**
     * @inheritdoc
     */
    toSpec: function() {
      return _toSpec(this._op, this.operand.toSpec());
    }

  });

  return NotFilter;

});