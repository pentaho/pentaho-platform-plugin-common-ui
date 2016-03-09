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
  "./AbstractTreeFilter"
], function(AbstractTreeFilter) {
  "use strict";

  /**
   * @name Or
   * @memberOf pentaho.data.filter
   *
   * @class
   * @extends pentaho.data.filter.AbstractTreeFilter
   *
   * @classdesc A filter that implements the union of a series of filters, each of which defines a set.
   *
   * @example
   * <caption> Create a new <code>Or</code> filter.</caption>
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
   *   var sales12k = new filter.IsIn("sales", [12000]);
   *   var inStock = new filter.IsEqual("inStock", true);
   *   var myFilter = new filter.Or([sales12k]);
   *   myFilter.or(inStock);
   *
   *   var filteredData = myFilter.apply(data);
   *   // filteredData.getValue(0, 0) === "A"
   *   // filteredData.getValue(1, 0) === "B"
   *   // filteredData.getValue(2, 0) === "C"
   * });
   *
   * @description Creates an `Or` filter that performs the union of a series of [filters]{@link pentaho.data.filter.AbstractFilter}.
   *
   * @param {!Array<pentaho.data.filter.AbstractFilter>} operands - The filters that will be subject to the union.
   *
   */
  var Or = AbstractTreeFilter.extend("pentaho.data.filter.Or", /** @lends pentaho.data.filter.Or# */{

    /**
     * @inheritdoc
     */
    get type() { return "or"; },

    _op: "$or",

    /**
     * @inheritdoc
     */
    contains: function(element) {
      var thisOperands = this.operands;
      var N = thisOperands.length;
      for(var k = 0; k < N; k++) {
        if(thisOperands[k].contains(element))
          return true;
      }
      return false; // false is the neutral element of an OR operation
    }

  });

  return Or;

});