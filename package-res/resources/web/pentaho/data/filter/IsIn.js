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
  "./AbstractPropertyFilter",
  "./_toSpec"
], function(AbstractPropertyFilter, toSpec) {
  "use strict";

  /**
   * @name IsIn
   * @memberOf pentaho.data.filter
   * @class
   * @extends pentaho.data.filter.AbstractPropertyFilter
   * @amd pentaho/data/filter/IsIn
   *
   * @classdesc A filter that defines the set of items in which the value of a property belongs to a reference set.
   *
   * @example
   * <caption> Create a new <code>IsIn</code> filter.</caption>
   *
   * require(["pentaho/data/Table", "pentaho/data/filter/IsIn"], function(Table, IsIn) {
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
   *   var filter = new IsIn("product", ["A", "B"]);
   *   var filteredData = filter.apply(data);
   *   //filteredData.getValue(0, 0) === "A"
   *   //filteredData.getValue(1, 0) === "B"
   * });
   *
   * @description Creates an `IsIn` filter given a property name and the list of values that define the set of admissible values.
   *
   * @param {string} property - The name of the property.
   * @param {Array<any>} value - The (extensive) list of values that belong to the reference set.
   *
   */
  var IsIn = AbstractPropertyFilter.extend("pentaho.data.filter.IsIn", /** @lends pentaho.data.filter.IsIn# */{
    constructor: function(property, value) {
      this.base(property, value || []);
    },

    /**
     * Reference set of values used for filtering
     *
     * @name value
     * @memberOf pentaho.data.filter.IsIn#
     * @override
     * @type {Array<any>}
     * @readonly
     */

    /**
     * @inheritdoc
     */
    get type() { return "isIn";},

    _op: "$in",

    /**
     * @inheritdoc
     */
    _operation: function(value) {
      return this.value.indexOf(value) > -1;
    },

    /**
     * @inheritdoc
     */
    toSpec: function() {
      return toSpec(this.property, toSpec(this._op, this.value.length ? this.value : null));
    }
  });

  return IsIn;
});