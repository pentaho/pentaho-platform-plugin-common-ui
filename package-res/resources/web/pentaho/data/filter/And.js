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
  "./AbstractTreeFilter",
  "require",
  "./Or"
], function(AbstractTreeFilter, require, Or) {
  "use strict";

  /**
   * @name And
   * @memberOf pentaho.data.filter
   * @class
   * @extends pentaho.data.filter.AbstractTreeFilter
   * @amd pentaho/data/filter/And
   *
   * @classdesc A filter that implements the intersection of a list of filters, each of which defines a set.
   *
   * @example
   * <caption> Create a new <code>And</code> filter.</caption>
   *
   * require(["pentaho/data/Table", "pentaho/data/filter/IsIn", "pentaho/data/filter/IsEqual", "pentaho/data/filter/And"], function(Table, IsIn, IsEqual, And) {
   *   var data = new Table({
   *     model: [
   *       {name: "product", type: "string", label: "Product"},
   *       {name: "sales", type: "number", label: "Sales"},
   *       {name: "inStock", type: "boolean", label: "In Stock"}
   *     ],
   *     rows: [
   *       {c: [{v: "A"}, {v: 12000}, {v: true}]},
   *       {c: [{v: "B"}, {v: 6000}, {v: true}]},
   *       {c: [{v: "C"}, {v: 12000}, {v: false}]},
   *       {c: [{v: "D"}, {v: 1000}, {v: false}]},
   *       {c: [{v: "E"}, {v: 2000}, {v: false}]},
   *       {c: [{v: "F"}, {v: 3000}, {v: false}]},
   *       {c: [{v: "G"}, {v: 4000}, {v: false}]}
   *     ]
   *   });
   *
   *
   *  var sales12k = new IsIn("sales", [12000]);
   *  var inStock = new IsEqual("inStock", true);
   *  var product = new IsIn("product", ["A"]);
   *  var filter = new And([sales12k, inStock]);
   *  filter.and(product);
   *  var data = filter.apply(data); //data.getValue(0, 0) === "A"
   * });
   *
   * @description Creates an `And` filter that performs the intersection of a list of [filters]{@link pentaho.data.filter.AbstractFilter}.
   *
   * @param {Array<pentaho.data.filter.AbstractFilter>} operands The list of filters that will be intersected.
   *
   */
  var And = AbstractTreeFilter.extend("pentaho.data.filter.And", /** @lends pentaho.data.filter.And# */{

    /**
     * @inheritdoc
     */
    get type() { return "and";},

    _op: "$and",

    /**
     * @inheritdoc
     */
    contains: function(element) {
      var thisOperands = this.operands;
      var N = thisOperands.length;
      for(var k = 0; k < N; k++) {
        if(!thisOperands[k].contains(element))
          return false;
      }
      return true;
    },

    /**
     * Returns the intersection between this filter and a variable number of other filters.
     * Intersections of intersections of filters (ANDs of ANDs) are avoided.
     *
     * @param {...pentaho.data.filter.AbstractFilter} filter - A filter to be added to the intersection operation.
     * @return {pentaho.data.filter.And} A filter that is the intersection of this filter with a list of other filters.
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
      if(!Or) Or = require("./Or");
      return new Or(this._invertedOperands());
    }
  });

  return And;

});